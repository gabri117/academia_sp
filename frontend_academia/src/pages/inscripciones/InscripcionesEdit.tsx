// src/pages/inscripciones/InscripcionesEdit.tsx
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Page from '@/components/layout/Page'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useApiQuery } from '@/hooks'
import { isApiError } from '@/api/types'
import {
  actualizarInscripcion,
  obtenerInscripcionPorId,
  type InscripcionDTO,
} from '@/services/inscripciones'
import { toYYYYMMDD } from '@/utils/format'
import InscripcionesForm, { type InscripcionFormValues } from './InscripcionesForm'

const toFormValues = (inscripcion: InscripcionDTO): InscripcionFormValues => {
  const fecha = inscripcion.fechaInscripcion
  const normalizedDate =
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha.length === 10
      ? fecha
      : toYYYYMMDD(new Date(fecha))
  const estadoNormalizado = inscripcion.estado === 'inactivo' ? 'inactivo' : 'activo'
  return {
    alumnoId: inscripcion.alumnoId,
    ofertaId: inscripcion.ofertaId,
    fechaInscripcion: normalizedDate,
    estado: estadoNormalizado,
  }
}

const FancyHeader = () => (
  <div className="mb-4 flex items-center gap-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066cc] via-[#3385ff] to-[#00a86b] text-base font-bold text-white shadow-[0_18px_36px_-18px_rgba(0,102,204,0.85)]">
      EI
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-semibold tracking-tight text-[#2e2e2e]">Editar inscripción</span>
      <span className="text-sm text-[#666666]">Actualiza la información de la inscripción</span>
    </div>
  </div>
)

const PAGE_TITLE = 'Editar inscripción'
const PAGE_DESC = 'Actualiza la información de la inscripción'

const InscripcionesEdit = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()

  const { data, isLoading, error } = useApiQuery<InscripcionDTO>({
    queryKey: ['inscripciones', 'detalle', id],
    queryFn: () => obtenerInscripcionPorId(id!),
    enabled: Boolean(id),
  })

  const initialValues = useMemo(() => (data ? toFormValues(data) : undefined), [data])

  const handleSubmit = async (values: InscripcionFormValues) => {
    if (!id) return
    try {
      await actualizarInscripcion(id, values)
      notify({
        title: 'Inscripción actualizada',
        description: 'Se actualizaron los datos de la inscripción.',
        variant: 'success',
      })
      navigate('/inscripciones')
    } catch (err) {
      const friendly =
        isApiError(err) && /network error/i.test(err.message ?? '')
          ? 'No se pudo actualizar la inscripción. Revisa los datos e inténtalo de nuevo.'
          : isApiError(err)
          ? err.message
          : 'No se pudo actualizar la inscripción. Revisa los datos e inténtalo de nuevo.'
      notify({ title: 'Error al actualizar', description: friendly, variant: 'error' })

      if (import.meta.env.DEV) {
        console.error('[InscripcionesEdit] Error al actualizar la inscripción:', err)
      }
    }
  }

  if (!id) {
    return (
      <Page title={PAGE_TITLE} description={PAGE_DESC}>
        <FancyHeader />
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Inscripción no encontrada.
          <div className="mt-3">
            <Button variant="secondary" onClick={() => navigate('/inscripciones')}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Volver al listado
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  if (isLoading) {
    return (
      <Page title={PAGE_TITLE} description={PAGE_DESC}>
        <FancyHeader />
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      </Page>
    )
  }

  if (error || !initialValues) {
    const msg = isApiError(error)
      ? error.message ?? 'No se pudo cargar la inscripción.'
      : 'No se pudo cargar la inscripción.'
    return (
      <Page title={PAGE_TITLE} description={PAGE_DESC}>
        <FancyHeader />
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {msg}
          <div className="mt-3">
            <Button variant="secondary" onClick={() => navigate('/inscripciones')}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Volver al listado
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page title={PAGE_TITLE} description={PAGE_DESC}>
      <FancyHeader />
      <InscripcionesForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/inscripciones')}
      />
    </Page>
  )
}

export default InscripcionesEdit
