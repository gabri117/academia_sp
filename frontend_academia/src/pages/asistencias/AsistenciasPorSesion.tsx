import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import Spinner from '../../components/ui/Spinner'
import Select from '../../components/form/Select'
import { useApiQuery } from '../../hooks'
import { isApiError } from '../../api/types'
import type { Asistencia } from '../../contract/moduleC'
import { listAsistenciasPorSesion } from '../../services/asistencias'
import { uuidSchema } from '../../validation/schemas'
import { useOfertaOptions, useSesionOptions } from '../../hooks/useCatalogOptions'

const filterSchema = z.object({
  ofertaId: uuidSchema('ofertaId'),
  sessionId: uuidSchema('sessionId'),
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

const AsistenciasPorSesion = () => {
  const methods = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ofertaId: '',
      sessionId: '',
    },
  })

  const ofertaId = methods.watch('ofertaId')
  const sessionId = methods.watch('sessionId')
  const [submittedSession, setSubmittedSession] = useState<string | null>(null)
  const navigate = useNavigate()

  const { data: ofertaOptions = [], isLoading: isLoadingOfertas } = useOfertaOptions()
  const { data: sesionOptions = [], isLoading: isLoadingSesiones } = useSesionOptions(
    ofertaId || null,
  )

  const { data, isLoading, isFetching, error, refetch } = useApiQuery<Asistencia[]>({
    queryKey: ['asistencias', 'sesion', submittedSession],
    queryFn: () => listAsistenciasPorSesion(submittedSession!),
    enabled: Boolean(submittedSession),
  })

  const asistencias = data ?? []

  const columns = useMemo<TableColumn<Asistencia>[]>(
    () => [
      { key: 'inscripcionId', header: 'Inscripcion' },
      {
        key: 'presente',
        header: 'Estado',
        render: (item) => (item.presente ? 'Presente' : 'Ausente'),
      },
      {
        key: 'sessionId',
        header: 'Registrar asistencia',
        render: (item) => (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              if (!ofertaId) return
              navigate(`/asistencias/registrar/${ofertaId}/${item.sessionId}`)
            }}
            disabled={!ofertaId}
          >
            Abrir registro
          </Button>
        ),
      },
    ],
    [navigate, ofertaId],
  )

  const onSubmit = (values: FilterValues) => {
    setSubmittedSession(values.sessionId)
  }

  const handleClear = () => {
    methods.reset({ ofertaId: '', sessionId: '' })
    setSubmittedSession(null)
  }

  return (
    <Page
      title="Asistencias por sesion"
      description="Consulta la asistencia registrada para una sesion de clase."
      actions={
        <Button variant="secondary" onClick={() => refetch()} disabled={!submittedSession || isFetching}>
          {isFetching ? 'Actualizando…' : 'Recargar'}
        </Button>
      }
    >
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="grid gap-4 rounded-lg border border-border bg-white p-4 shadow-sm md:grid-cols-3"
        >
          <Select
            label="Oferta"
            placeholder={isLoadingOfertas ? 'Cargando ofertas...' : 'Selecciona una oferta'}
            options={ofertaOptions}
            disabled={isLoadingOfertas}
            {...methods.register('ofertaId')}
            error={methods.formState.errors.ofertaId?.message}
          />
          <Select
            label="Sesion"
            placeholder={
              ofertaId
                ? isLoadingSesiones
                  ? 'Cargando sesiones...'
                  : 'Selecciona una sesion'
                : 'Selecciona primero una oferta'
            }
            options={sesionOptions}
            disabled={!ofertaId || isLoadingSesiones}
            {...methods.register('sessionId')}
            error={methods.formState.errors.sessionId?.message}
          />
          <div className="flex items-end justify-end gap-2">
            <Button type="submit" disabled={!sessionId}>
              Buscar
            </Button>
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
          data={submittedSession ? asistencias : []}
          columns={columns}
          emptyMessage={
            submittedSession
              ? 'No se encontraron asistencias registradas para esta sesion.'
              : 'Selecciona una sesion para consultar asistencias.'
          }
          getRowKey={(item) => item.inscripcionId}
        />
      )}
    </Page>
  )
}

export default AsistenciasPorSesion
