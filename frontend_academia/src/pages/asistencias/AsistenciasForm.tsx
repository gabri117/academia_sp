import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Select from '../../components/form/Select'
import { useToast } from '../../components/ui/Toast'
import { useApiMutation } from '../../hooks'
import { isApiError } from '../../api/types'
import type { AsistenciaCreateDTO } from '../../contract/moduleC'
import { registrarAsistencia } from '../../services/asistencias'
import { asistenciaCreateSchema } from '../../validation/schemas'
import {
  useInscripcionOptions,
  useOfertaOptions,
  useSesionOptions,
} from '../../hooks/useCatalogOptions'

type AsistenciaFormValues = z.infer<typeof asistenciaCreateSchema> & {
  ofertaId: string
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const AsistenciasForm = () => {
  const { notify } = useToast()
  const navigate = useNavigate()
  
  const asistenciaFormSchema = asistenciaCreateSchema.extend({
  ofertaId: z.string().uuid(),
})
 const methods = useForm<AsistenciaFormValues>({
  resolver: zodResolver(asistenciaFormSchema),
  defaultValues: {
    ofertaId: '',
    sessionId: '',
    inscripcionId: '',
    presente: true,
  },
})

  const ofertaId = methods.watch('ofertaId')

  const { data: ofertaOptions = [], isLoading: isLoadingOfertas } = useOfertaOptions()
  const { data: sesionOptions = [], isLoading: isLoadingSesiones } = useSesionOptions(
    ofertaId || null,
  )
  const { data: inscripcionOptions = [], isLoading: isLoadingInscripciones } = useInscripcionOptions(
    ofertaId || null,
  )

  useEffect(() => {
    methods.setValue('sessionId', '')
    methods.setValue('inscripcionId', '')
  }, [ofertaId, methods])

  const { mutateAsync: guardarAsistencia, isPending } = useApiMutation({
    mutationFn: (payload: AsistenciaCreateDTO) => registrarAsistencia(payload),
    onSuccess: () => {
      notify({
        title: 'Asistencia registrada',
        description: 'Se guard� la asistencia correctamente.',
        variant: 'success',
      })
      navigate('/asistencias')
    },
    onError: (error) => {
      notify({
        title: 'Error al registrar asistencia',
        description: getErrorMessage(error, 'No fue posible registrar la asistencia.'),
        variant: 'error',
      })
    },
  })

  const onSubmit = async ({ ofertaId: _ofertaId, ...values }: AsistenciaFormValues) => {
    await guardarAsistencia(values as AsistenciaCreateDTO)
  }

  return (
    <Page
      title="Registrar asistencia"
      description="Marca el estado de asistencia de una inscripci�n para una sesi�n de clase."
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
          <Select
            label="Oferta"
            placeholder={isLoadingOfertas ? 'Cargando ofertas...' : 'Selecciona una oferta'}
            options={ofertaOptions}
            disabled={isLoadingOfertas}
            {...methods.register('ofertaId')}
            error={methods.formState.errors.ofertaId?.message}
          />
          <Select
            label="Sesi�n"
            placeholder={
              ofertaId
                ? isLoadingSesiones
                  ? 'Cargando sesiones...'
                  : 'Selecciona una sesi�n'
                : 'Selecciona primero una oferta'
            }
            options={sesionOptions}
            disabled={!ofertaId || isLoadingSesiones}
            {...methods.register('sessionId')}
            error={methods.formState.errors.sessionId?.message}
          />
          <Select
            label="Inscripci�n"
            placeholder={
              ofertaId
                ? isLoadingInscripciones
                  ? 'Cargando inscripciones...'
                  : 'Selecciona una inscripci�n'
                : 'Selecciona primero una oferta'
            }
            options={inscripcionOptions}
            disabled={!ofertaId || isLoadingInscripciones}
            {...methods.register('inscripcionId')}
            error={methods.formState.errors.inscripcionId?.message}
          />
          <Controller
            name="presente"
            control={methods.control}
            render={({ field, fieldState }) => (
              <Select
                label="Estado"
                value={field.value ? 'true' : 'false'}
                onChange={(event) => field.onChange(event.target.value === 'true')}
                error={fieldState.error?.message}
                options={[
                  { label: 'Presente', value: 'true' },
                  { label: 'Ausente', value: 'false' },
                ]}
              />
            )}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/asistencias')}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending}>
              Guardar asistencia
            </Button>
          </div>
        </form>
      </FormProvider>
    </Page>
  )
}

export default AsistenciasForm
