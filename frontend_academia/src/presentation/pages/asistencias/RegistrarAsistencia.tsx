import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

//Esto tenia listarInscripcionesPorOferta
import { httpClient, listInscripcionesPorOferta } from '../../../api/client'
import { isApiError } from '../../../api/types'
import Page from '../../../components/layout/Page'
import Select from '../../../components/form/Select'
import Button from '../../../components/ui/Button'
import Spinner from '../../../components/ui/Spinner'
import Table, { type TableColumn } from '../../../components/ui/Table'
import { useToast } from '../../../components/ui/Toast'
import { useApiMutation, useApiQuery } from '../../../hooks'
import { useOfertaOptions, useSesionOptions } from '../../../hooks/useCatalogOptions'
import { uuidSchema } from '../../../validation/schemas'

const filterSchema = z.object({
  ofertaId: uuidSchema('ofertaId'),
  sesionId: uuidSchema('sesionId'),
})

type FilterFormValues = z.infer<typeof filterSchema>

const inscripcionSchema = z.object({
  id: z.string(),
  alumnoNombreCompleto: z.string().optional(),
  alumnoNombre: z.string().optional(),
  alumnoApellido: z.string().optional(),
})

type InscripcionRecord = z.infer<typeof inscripcionSchema>

const inscripcionListSchema = z.array(inscripcionSchema)

type AlumnoEnSesion = {
  id: string
  alumno: string
}

type AttendanceValue = 'present' | 'absent'
type AttendanceStatus = AttendanceValue | 'unmarked'

type AttendanceSelection = Record<string, AttendanceStatus>

type AttendancePayloadItem = {
  sessionId: string
  inscripcionId: string
  presente: boolean
}

type AttendanceRow = {
  inscripcionId: string
  alumno: string
  estado: string
}

const statusLabels: Record<AttendanceStatus, string> = {
  present: 'Presente',
  absent: 'Ausente',
  unmarked: 'Sin marcar',
}

const getAlumnoNombre = (inscripcion: InscripcionRecord): string => {
  if (inscripcion.alumnoNombreCompleto && inscripcion.alumnoNombreCompleto.trim().length > 0) {
    return inscripcion.alumnoNombreCompleto.trim()
  }

  const names = [inscripcion.alumnoNombre, inscripcion.alumnoApellido].filter(
    (value): value is string => Boolean(value && value.trim().length > 0),
  )

  if (names.length > 0) {
    return names.join(' ')
  }

  return inscripcion.id
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const RegistrarAsistencia = () => {
  const { notify } = useToast()

  const methods = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ofertaId: '',
      sesionId: '',
    },
  })

  const ofertaId = methods.watch('ofertaId')
  const sesionId = methods.watch('sesionId')

  const { data: ofertaOptions = [], isLoading: isLoadingOfertas } = useOfertaOptions()
  const { data: sesionOptions = [], isLoading: isLoadingSesiones } = useSesionOptions(
    ofertaId || null,
  )

  useEffect(() => {
    methods.setValue('sesionId', '')
    methods.clearErrors('sesionId')
  }, [methods, ofertaId])

  const {
    data: inscripciones = [],
    isLoading: isLoadingInscripciones,
    isFetching: isFetchingInscripciones,
    error: inscripcionesError,
    refetch: refetchInscripciones,
  } = useApiQuery<AlumnoEnSesion[]>({
    queryKey: ['inscripciones', 'registro-asistencia', ofertaId ?? 'none', sesionId ?? 'none'],
    queryFn: async () => {
      if (!ofertaId) return []
      //Aqui tambien se modificó
      const response = await listInscripcionesPorOferta(ofertaId)
      const parsed = inscripcionListSchema.parse(response)

      return parsed.map<AlumnoEnSesion>((inscripcion) => ({
        id: inscripcion.id,
        alumno: getAlumnoNombre(inscripcion),
      }))
    },
    enabled: Boolean(ofertaId && sesionId),
  })

  const [attendanceSelections, setAttendanceSelections] = useState<AttendanceSelection>({})

  useEffect(() => {
    setAttendanceSelections({})
  }, [ofertaId, sesionId])

  useEffect(() => {
    if (!inscripciones.length) {
      setAttendanceSelections({})
      return
    }

    setAttendanceSelections((current) => {
      const validIds = new Set(inscripciones.map((item) => item.id))
      let hasChanges = false
      const nextSelections: AttendanceSelection = {}

      for (const [inscripcionId, status] of Object.entries(current)) {
        if (validIds.has(inscripcionId)) {
          nextSelections[inscripcionId] = status
        } else {
          hasChanges = true
        }
      }

      return hasChanges ? nextSelections : current
    })
  }, [inscripciones])

  const updateAttendance = (inscripcionId: string, status: AttendanceStatus) => {
    setAttendanceSelections((current) => {
      if (status === 'unmarked') {
        if (!(inscripcionId in current)) {
          return current
        }
        const { [inscripcionId]: _removed, ...rest } = current
        return rest
      }

      if (current[inscripcionId] === status) {
        return current
      }

      return { ...current, [inscripcionId]: status }
    })
  }

  const { mutateAsync: guardarAsistencias, isPending: isSaving } = useApiMutation<
  void,
  AttendancePayloadItem[]
  >({
  // ✅ Cambiado: guarda asistencias una por una (compatible con el backend actual)
  mutationFn: async (payload) => {
    for (const asistencia of payload) {
      await httpClient.post<void>('/asistencias', asistencia)
    }
  },
  onSuccess: async () => {
    notify({
      title: 'Asistencia guardada',
      description: 'Se registraron las asistencias seleccionadas.',
      variant: 'success',
    })

    setAttendanceSelections({})

    if (ofertaId && sesionId) {
      await refetchInscripciones()
    }
  },
  onError: (error) => {
    notify({
      title: 'Error al guardar',
      description: getErrorMessage(error, 'No fue posible guardar la asistencia.'),
      variant: 'error',
    })
  },
})


  const rows = useMemo<AttendanceRow[]>(() => {
    return inscripciones.map((inscripcion) => {
      const status: AttendanceStatus = attendanceSelections[inscripcion.id] ?? 'unmarked'
      return {
        inscripcionId: inscripcion.id,
        alumno: inscripcion.alumno,
        estado: statusLabels[status],
      }
    })
  }, [inscripciones, attendanceSelections])

  const markedCount = Object.keys(attendanceSelections).length
  const canSave = Boolean(sesionId) && markedCount > 0 && rows.length > 0

  const columns: TableColumn<AttendanceRow>[] = [
    { key: 'alumno', header: 'Alumno' },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => {
        const status: AttendanceStatus = attendanceSelections[row.inscripcionId] ?? 'unmarked'

        return (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={status === 'present' ? 'primary' : 'secondary'}
              onClick={() => updateAttendance(row.inscripcionId, 'present')}
              disabled={isSaving}
            >
              Presente
            </Button>
            <Button
              type="button"
              size="sm"
              variant={status === 'absent' ? 'danger' : 'secondary'}
              onClick={() => updateAttendance(row.inscripcionId, 'absent')}
              disabled={isSaving}
            >
              Ausente
            </Button>
            <Button
              type="button"
              size="sm"
              variant={status === 'unmarked' ? 'ghost' : 'secondary'}
              onClick={() => updateAttendance(row.inscripcionId, 'unmarked')}
              disabled={isSaving}
            >
              Sin marcar
            </Button>
          </div>
        )
      },
    },
  ]

  const handleSubmit = async (values: FilterFormValues) => {
    const payload = Object.entries(attendanceSelections).map(
    ([inscripcionId, status]) => ({
      sessionId: values.sesionId, // ✅ corregido a inglés
      inscripcionId,
      presente: status === 'present',
    }),
  )

    if (payload.length === 0) {
      notify({
        title: 'Sin asistencias seleccionadas',
        description: 'Marca al menos un alumno como presente o ausente antes de guardar.',
        variant: 'warning',
      })
      return
    }

    await guardarAsistencias(payload)
  }

  const handleReset = () => {
    methods.reset({
      ofertaId: '',
      sesionId: '',
    })
    setAttendanceSelections({})
  }

  const handleRefresh = () => {
    if (!ofertaId || !sesionId) return
    refetchInscripciones()
  }

  return (
    <Page
      title="Registrar asistencia"
      description="Marca la asistencia de los alumnos inscritos para una sesion existente."
      actions={
        <Button
          type="button"
          variant="secondary"
          onClick={handleRefresh}
          disabled={!ofertaId || !sesionId || isFetchingInscripciones || isLoadingInscripciones}
        >
          {isFetchingInscripciones ? 'Actualizando...' : 'Recargar lista'}
        </Button>
      }
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2">
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
              {...methods.register('sesionId')}
              error={methods.formState.errors.sesionId?.message}
            />
          </div>

          {inscripcionesError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {getErrorMessage(inscripcionesError, 'No fue posible cargar las inscripciones.')}
            </div>
          ) : !ofertaId || !sesionId ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-gray-500">
              Selecciona una oferta y una sesion para cargar los alumnos inscritos.
            </div>
          ) : isLoadingInscripciones ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {isFetchingInscripciones && (
                <p className="text-sm text-gray-500">Actualizando lista de inscripciones...</p>
              )}
              <Table
                data={rows}
                columns={columns}
                className="w-full"
                emptyMessage="No se encontraron alumnos inscritos para esta oferta."
                getRowKey={(row) => row.inscripcionId}
              />
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="text-sm text-gray-600">
              {markedCount > 0
                ? `${markedCount} alumno${markedCount === 1 ? '' : 's'} marcad${
                    markedCount === 1 ? 'o' : 'os'
                  }.`
                : 'Sin alumnos marcados.'}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={handleReset} disabled={isSaving}>
                Limpiar
              </Button>
              <Button type="submit" isLoading={isSaving} disabled={!canSave}>
                Guardar asistencia
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Page>
  )
}

export default RegistrarAsistencia
