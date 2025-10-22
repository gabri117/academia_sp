import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { isApiError } from '@/api/types'
import PanelCard from '@/components/kit/PanelCard'
import Input from '@/components/form/Input'
import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Table, { type TableColumn } from '@/components/ui/Table'
import { cls } from '@/components/ui/stylekit'
import { useToast } from '@/components/ui/Toast'
import type { Cargo } from '@/contract/moduleC'
import { useApiMutation, useApiQuery } from '@/hooks'
import { listarCargosPorTarifa, recalcularCargo } from '@/services/cargos'
import { uuidSchema } from '@/validation/schemas'

const formatCurrency = (value: number) =>
  `Q ${Number(value ?? 0).toFixed(2)}`

const filterSchema = z.object({
  tarifaId: uuidSchema('tarifaId'),
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

const CargosPorTarifa = () => {
  const { notify } = useToast()

  const methods = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      tarifaId: '',
    },
  })

  const [tarifaId, setTarifaId] = useState<string | null>(null)

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useApiQuery<Cargo[]>({
    queryKey: ['cargos', tarifaId],
    queryFn: () => listarCargosPorTarifa(tarifaId!),
    enabled: Boolean(tarifaId),
  })

  const cargos = useMemo(() => data ?? [], [data])

  const { mutateAsync: recalcular, isPending: isRecalculando } = useApiMutation({
    mutationFn: (cargoId: string) => recalcularCargo(cargoId),
    onSuccess: (_, cargoId) => {
      notify({
        title: 'Cargo recalculado',
        description: `Se recalculo el cargo ${cargoId}.`,
        variant: 'success',
      })
      refetch()
    },
    onError: (mutationError) => {
      notify({
        title: 'Error al recalcular cargo',
        description: getErrorMessage(mutationError, 'No fue posible recalcular el cargo.'),
        variant: 'error',
      })
    },
  })

  const columns: TableColumn<Cargo>[] = useMemo(
    () => [
      {
        key: 'cargoId',
        header: 'Identificador',
        render: (item) => (
          <span className="font-medium text-[#1f3c63]">{`${item.cargoId.slice(0, 8)}...`}</span>
        ),
      },
      { key: 'periodoMes', header: 'Mes' },
      {
        key: 'concepto',
        header: 'Concepto',
        render: (item) => (
          <span className="rounded-full bg-[rgba(0,102,204,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f3c63]">
            {item.concepto || '--'}
          </span>
        ),
      },
      {
        key: 'monto',
        header: 'Monto',
        render: (item) => formatCurrency(item.monto),
      },
      {
        key: 'estado',
        header: 'Estado',
        render: (item) => (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              item.estado === 'PENDIENTE'
                ? 'bg-[rgba(255,214,0,0.18)] text-[#b25600]'
                : 'bg-[rgba(0,102,204,0.12)] text-[#1f3c63]'
            }`}
          >
            {item.estado}
          </span>
        ),
      },
    ],
    [],
  )

  const onSubmit = (values: FilterValues) => {
    setTarifaId(values.tarifaId)
  }

  const handleClear = () => {
    methods.reset({ tarifaId: '' })
    setTarifaId(null)
  }

  const filtrosLabel = tarifaId ? `Tarifa ${tarifaId.slice(0, 8)}...` : 'Sin tarifa seleccionada'

  return (
    <Page title="Cargos por tarifa" description="Consulta y recalcula cargos generados para una tarifa.">
      <div className="grid gap-6">
        <PanelCard className="px-6 py-6">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="grid gap-4 md:grid-cols-12 md:items-end"
            >
              <div className="md:col-span-9">
                <Input
                  label="Tarifa (UUID)"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  {...methods.register('tarifaId')}
                  error={methods.formState.errors.tarifaId?.message}
                />
                <p className="mt-1 text-xs text-[#667085]">
                  {tarifaId
                    ? `Consultando cargos para ${filtrosLabel}.`
                    : 'Introduce el identificador de tarifa para cargar sus cargos generados.'}
                </p>
              </div>
              <div className="md:col-span-3 flex gap-2 md:justify-end">
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
            {getErrorMessage(error, 'No fue posible cargar los cargos.')}
          </PanelCard>
        ) : isLoading ? (
          <PanelCard className="flex justify-center px-6 py-12">
            <Spinner size="lg" />
          </PanelCard>
        ) : (
          <PanelCard className="px-0 py-0">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-[#1f3c63]">Resultados</h3>
                <p className="text-xs text-[#667085]">
                  {tarifaId
                    ? `Se encontraron ${cargos.length} cargo(s) para ${filtrosLabel}.`
                    : 'Ingresa una tarifa para visualizar sus cargos calculados.'}
                </p>
              </div>
              <Button variant="secondary" disabled={!tarifaId || isFetching} onClick={() => refetch()}>
                {isFetching ? 'Actualizando...' : 'Refrescar'}
              </Button>
            </div>

            <Table
              data={tarifaId ? cargos : []}
              columns={columns}
              emptyMessage={
                tarifaId
                  ? 'No se encontraron cargos para la tarifa seleccionada.'
                  : 'Ingresa el UUID de una tarifa para visualizar sus cargos.'
              }
              getRowKey={(item) => item.cargoId}
              classNameHeader={cls.tableHeader}
              classNameRow={cls.tableRow}
              renderActions={(cargo) => (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => recalcular(cargo.cargoId)}
                  isLoading={isRecalculando}
                  disabled={isRecalculando}
                >
                  Recalcular
                </Button>
              )}
            />
          </PanelCard>
        )}
      </div>
    </Page>
  )
}

export default CargosPorTarifa
