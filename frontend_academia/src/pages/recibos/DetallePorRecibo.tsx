import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMemo, useState } from 'react'

import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'
import Input from '@/components/form/Input'
import PanelCard from '@/components/kit/PanelCard'
import HeroSummary from '@/components/kit/HeroSummary'
import { cls } from '@/components/ui/stylekit'
import { useApiQuery } from '@/hooks'
import { isApiError } from '@/api/types'
import type { DetalleRecibo } from '@/contract/moduleC'
import { listarDetalleReciboPorRecibo } from '@/services/detalleRecibo'
import { uuidSchema } from '@/validation/schemas'

const columns: TableColumn<DetalleRecibo>[] = [
  { key: 'cargoId', header: 'Cargo' },
  {
    key: 'montoAplicado',
    header: 'Monto aplicado',
    render: (item) => item.montoAplicado.toFixed(2),
  },
]

const filterSchema = z.object({
  reciboId: uuidSchema('reciboId'),
})

type FilterValues = z.infer<typeof filterSchema>

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const DetallePorRecibo = () => {
  const methods = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      reciboId: '',
    },
  })

  const [reciboId, setReciboId] = useState<string | null>(null)

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useApiQuery<DetalleRecibo[]>({
    queryKey: ['detalle-recibo', reciboId],
    queryFn: () => listarDetalleReciboPorRecibo(reciboId!),
    enabled: Boolean(reciboId),
  })

  const detalles = useMemo(() => data ?? [], [data])

  const heroTotal = reciboId ? detalles.length : 0
  const filtrosLabel = reciboId ? `Recibo seleccionado: ${reciboId.slice(0, 8)}...` : 'Sin recibo seleccionado'
  const filtrosAccent: 'white' | 'yellow' = reciboId ? 'white' : 'yellow'

  const onSubmit = (values: FilterValues) => {
    setReciboId(values.reciboId)
  }

  const handleClear = () => {
    methods.reset({ reciboId: '' })
    setReciboId(null)
  }

  return (
    <Page title="Detalle de recibo" description="Consulta los cargos aplicados a un recibo.">
      <HeroSummary
        title="Detalle de recibo"
        total={heroTotal}
        filtersLabel={filtrosLabel}
        filtersAccent={filtrosAccent}
      />

      <div className="grid gap-6">
        <PanelCard className="px-6 py-6">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="grid gap-4 md:grid-cols-12 md:items-end"
            >
              <div className="md:col-span-8">
                <Input
                  label="Recibo (UUID)"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  {...methods.register('reciboId')}
                  error={methods.formState.errors.reciboId?.message}
                />
                <p className="mt-1 text-xs text-[#667085]">
                  Ingresa el identificador completo del recibo para ver los cargos aplicados.
                </p>
              </div>
              <div className="md:col-span-4 flex gap-2 md:justify-end">
                <Button type="submit">{isFetching ? 'Buscando...' : 'Buscar'}</Button>
                <Button type="button" variant="secondary" onClick={handleClear}>
                  Limpiar
                </Button>
              </div>
            </form>
          </FormProvider>
        </PanelCard>

        {error ? (
          <PanelCard className="border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {getErrorMessage(error, 'No fue posible cargar el detalle del recibo.')}
          </PanelCard>
        ) : isLoading ? (
          <PanelCard className="flex justify-center px-6 py-12">
            <Spinner size="lg" />
          </PanelCard>
        ) : (
          <PanelCard className="px-0 py-0">
            <div className="flex flex-col gap-4 border-b border-[#dbe7f7]/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#1f3c63]">Resultados</h3>
                <p className="text-xs text-[#667085]">
                  {reciboId
                    ? `Se encontraron ${detalles.length} cargo(s) aplicados a este recibo.`
                    : 'Ingresa el UUID de un recibo para consultar su detalle.'}
                </p>
              </div>
              <Button variant="secondary" onClick={() => refetch()} disabled={!reciboId || isFetching}>
                {isFetching ? 'Actualizando...' : 'Recargar'}
              </Button>
            </div>

            <Table
              data={reciboId ? detalles : []}
              columns={columns}
              emptyMessage={
                reciboId
                  ? 'El recibo aun no tiene detalles registrados.'
                  : 'Ingresa el UUID de un recibo para consultar su detalle.'
              }
              getRowKey={(item) => `${item.reciboId}-${item.cargoId}`}
              classNameHeader={cls.tableHeader}
              classNameRow={cls.tableRow}
            />
          </PanelCard>
        )}
      </div>
    </Page>
  )
}

export default DetallePorRecibo
