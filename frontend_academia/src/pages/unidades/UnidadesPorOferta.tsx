import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMemo, useState } from 'react'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import Spinner from '../../components/ui/Spinner'
import Input from '../../components/form/Input'
import { useToast } from '../../components/ui/Toast'
import { useApiQuery } from '../../hooks'
import { isApiError } from '../../api/types'
import type { UnidadEvaluacion } from '../../contract/moduleC'
import { listarUnidadesPorOferta } from '../../services/unidades'
import { uuidSchema } from '../../validation/schemas'

const columns: TableColumn<UnidadEvaluacion>[] = [
  { key: 'nombre', header: 'Unidad' },
  { key: 'evaluacionId', header: 'Evaluación' },
  { key: 'ofertaId', header: 'Oferta' },
]

const filterSchema = z.object({
  ofertaId: uuidSchema('ofertaId'),
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

const UnidadesPorOferta = () => {
  const { notify } = useToast()

  const methods = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ofertaId: '',
    },
  })

  const [ofertaId, setOfertaId] = useState<string | null>(null)

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useApiQuery<UnidadEvaluacion[]>({
    queryKey: ['unidades', ofertaId],
    queryFn: () => listarUnidadesPorOferta(ofertaId!),
    enabled: Boolean(ofertaId),
  })

  const unidades = useMemo(() => data ?? [], [data])

  const onSubmit = (values: FilterValues) => {
    setOfertaId(values.ofertaId)
  }

  const handleClear = () => {
    methods.reset({ ofertaId: '' })
    setOfertaId(null)
  }

  return (
    <Page
      title="Unidades por oferta"
      description="Consulta las unidades de evaluación asociadas a una oferta de curso."
      actions={
        <Button
          variant="secondary"
          onClick={() => refetch()}
          disabled={!ofertaId || isFetching}
        >
          {isFetching ? 'Actualizando…' : 'Recargar'}
        </Button>
      }
    >
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-lg border border-border bg-white p-4 shadow-sm md:flex-row md:items-end"
        >
          <Input
            className="flex-1"
            label="Oferta (UUID)"
            placeholder="00000000-0000-0000-0000-000000000000"
            {...methods.register('ofertaId')}
            error={methods.formState.errors.ofertaId?.message}
          />
          <div className="flex gap-2">
            <Button type="submit">Buscar</Button>
            <Button type="button" variant="secondary" onClick={handleClear}>
              Limpiar
            </Button>
          </div>
        </form>
      </FormProvider>

      {error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(error, 'No fue posible cargar las unidades.')}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table
          className="mt-6"
          data={ofertaId ? unidades : []}
          columns={columns}
          emptyMessage={
            ofertaId
              ? 'No se encontraron unidades para la oferta seleccionada.'
              : 'Ingresa el UUID de una oferta para visualizar sus unidades.'
          }
          getRowKey={(item) => item.evaluacionId}
        />
      )}
    </Page>
  )
}

export default UnidadesPorOferta
