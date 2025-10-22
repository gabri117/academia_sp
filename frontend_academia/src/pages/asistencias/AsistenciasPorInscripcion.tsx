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
import type { Asistencia } from '../../contract/moduleC'
import { listAsistenciasPorInscripcion } from '../../services/asistencias'
import { uuidSchema } from '../../validation/schemas'

const columns: TableColumn<Asistencia>[] = [
  { key: 'sessionId', header: 'Sesión' },
  {
    key: 'presente',
    header: 'Estado',
    render: (item) => (item.presente ? 'Presente' : 'Ausente'),
  },
]

const filterSchema = z.object({
  inscripcionId: uuidSchema('inscripcionId'),
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

const AsistenciasPorInscripcion = () => {
  const { notify } = useToast()

  const methods = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      inscripcionId: '',
    },
  })

  const [inscripcionId, setInscripcionId] = useState<string | null>(null)

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useApiQuery<Asistencia[]>({
    queryKey: ['asistencias', 'inscripcion', inscripcionId],
    queryFn: () => listAsistenciasPorInscripcion(inscripcionId!),
    enabled: Boolean(inscripcionId),
  })

  const asistencias = useMemo(() => data ?? [], [data])

  const onSubmit = (values: FilterValues) => {
    setInscripcionId(values.inscripcionId)
  }

  const handleClear = () => {
    methods.reset({ inscripcionId: '' })
    setInscripcionId(null)
  }

  return (
    <Page
      title="Asistencias por inscripción"
      description="Consulta la asistencia registrada para una inscripción específica."
      actions={
        <Button
          variant="secondary"
          onClick={() => refetch()}
          disabled={!inscripcionId || isFetching}
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
            label="Inscripción (UUID)"
            placeholder="00000000-0000-0000-0000-000000000000"
            {...methods.register('inscripcionId')}
            error={methods.formState.errors.inscripcionId?.message}
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
          {getErrorMessage(error, 'No fue posible cargar las asistencias.')}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table
          className="mt-6"
          data={inscripcionId ? asistencias : []}
          columns={columns}
          emptyMessage={
            inscripcionId
              ? 'No se encontraron asistencias registradas para esta inscripción.'
              : 'Ingresa el UUID de una inscripción para consultar asistencias.'
          }
          getRowKey={(item) => `${item.sessionId}-${item.inscripcionId}`}
        />
      )}
    </Page>
  )
}

export default AsistenciasPorInscripcion
