// src/pages/inscripciones/InscripcionesCreate.tsx
import { useNavigate } from 'react-router-dom'

import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { isApiError } from '@/api/types'
import { createInscripcion } from '@/services/inscripciones'
import InscripcionesForm from './InscripcionesForm'
import type { InscripcionFormValues } from './InscripcionesForm'

const formCard =
  'rounded-3xl border border-[#d5e5fb] bg-white shadow-[0_22px_48px_-28px_rgba(0,68,140,0.25)] backdrop-blur'

const InscripcionesCreate = () => {
  const navigate = useNavigate()
  const { notify } = useToast()

  const handleSubmit = async (values: InscripcionFormValues) => {
    try {
      await createInscripcion({
        alumnoId: values.alumnoId,
        ofertaId: values.ofertaId,
        fechaInscripcion: values.fechaInscripcion,
        estado: values.estado,
      })
      notify({
        title: 'Inscripción creada',
        description: 'Se registró la inscripción correctamente.',
        variant: 'success',
      })
      navigate('/inscripciones')
    } catch (error: unknown) {
      const message = isApiError(error)
        ? error.message
        : 'No se pudo crear la inscripción. Revisa los datos e inténtalo de nuevo.'
      notify({
        title: 'Error al crear',
        description: message,
        variant: 'error',
      })
    }
  }

  return (
    <Page
      title="Nueva inscripción"
      description="Registra un alumno en una oferta vigente"
      actions={
        <Button variant="secondary" onClick={() => navigate('/inscripciones')}>
          {/* icono lista */}
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Ver listado
        </Button>
      }
    >
      {/* Encabezado visual (antes estaba en title) */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066cc] via-[#3385ff] to-[#00a86b] text-base font-bold text-white shadow-[0_18px_36px_-18px_rgba(0,102,204,0.85)]">
          NI
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-semibold tracking-tight text-[#2e2e2e]">Nueva inscripción</span>
          <span className="text-sm text-[#666666]">Registra un alumno en una oferta vigente</span>
        </div>
      </div>

      <div className="grid gap-6">
        <div className={`${formCard} p-6`}>
          <div className="mb-6 flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0066cc]">Formulario</span>
            <h2 className="text-xl font-semibold text-[#1f3c63]">Datos de la inscripción</h2>
          </div>

          <InscripcionesForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/inscripciones')}
          />
        </div>
      </div>
    </Page>
  )
}

export default InscripcionesCreate
