import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Input from '../../components/form/Input'
import { useToast } from '../../components/ui/Toast'
import { useApiMutation } from '../../hooks'
import { isApiError } from '../../api/types'
import type { CalificacionCreateDTO } from '../../contract/moduleC'
import { registrarCalificacion } from '../../services/calificaciones'
import { calificacionCreateSchema } from '../../validation/schemas'

type CalificacionFormValues = z.infer<typeof calificacionCreateSchema>

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const CalificacionesForm = () => {
  const { notify } = useToast()
  const navigate = useNavigate()

  const methods = useForm<CalificacionFormValues>({
    resolver: zodResolver(calificacionCreateSchema),
    defaultValues: {
      inscripcionId: '',
      evaluacionId: '',
      nota: 0,
      observaciones: undefined,
    },
  })

  const { mutateAsync: guardarCalificacion, isPending } = useApiMutation({
    mutationFn: (payload: CalificacionCreateDTO) => registrarCalificacion(payload),
    onSuccess: () => {
      notify({
        title: 'Calificación registrada',
        description: 'La nota se registró correctamente.',
        variant: 'success',
      })
      navigate('/calificaciones')
    },
    onError: (error) => {
      notify({
        title: 'Error al registrar calificación',
        description: getErrorMessage(error, 'No fue posible registrar la calificación.'),
        variant: 'error',
      })
    },
  })

  const onSubmit = async (values: CalificacionFormValues) => {
    const payload: CalificacionCreateDTO = {
      inscripcionId: values.inscripcionId,
      evaluacionId: values.evaluacionId,
      nota: values.nota,
      observaciones: values.observaciones?.trim() || undefined,
    }
    await guardarCalificacion(payload)
  }

  return (
    <Page
      title="Registrar calificación"
      description="Captura la calificación para una inscripción y unidad de evaluación."
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
          <Input
            label="Inscripción (UUID)"
            placeholder="00000000-0000-0000-0000-000000000000"
            {...methods.register('inscripcionId')}
            error={methods.formState.errors.inscripcionId?.message}
          />
          <Input
            label="Unidad de evaluación (UUID)"
            placeholder="00000000-0000-0000-0000-000000000000"
            {...methods.register('evaluacionId')}
            error={methods.formState.errors.evaluacionId?.message}
          />
          <Input
            label="Nota"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...methods.register('nota', {
              setValueAs: (value: string) => {
                const parsed = Number.parseFloat(value)
                return Number.isNaN(parsed) ? 0 : parsed
              },
            })}
            error={methods.formState.errors.nota?.message}
          />
          <Input
            label="Observaciones"
            placeholder="Comentarios opcionales"
            maxLength={250}
            {...methods.register('observaciones', {
              setValueAs: (value: string) => (value?.trim() ? value : undefined),
            })}
            error={methods.formState.errors.observaciones?.message}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/calificaciones')}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending}>
              Guardar calificación
            </Button>
          </div>
        </form>
      </FormProvider>
    </Page>
  )
}

export default CalificacionesForm
