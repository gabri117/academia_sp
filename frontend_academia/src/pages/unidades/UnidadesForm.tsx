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
import type { UnidadEvaluacionCreateDTO } from '../../contract/moduleC'
import { crearUnidadEvaluacion } from '../../services/unidades'
import { unidadEvaluacionCreateSchema } from '../../validation/schemas'

type UnidadFormValues = z.infer<typeof unidadEvaluacionCreateSchema>

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const UnidadesForm = () => {
  const navigate = useNavigate()
  const { notify } = useToast()

  const methods = useForm<UnidadFormValues>({
    resolver: zodResolver(unidadEvaluacionCreateSchema),
    defaultValues: {
      ofertaId: '',
      nombre: '',
    },
  })

  const { mutateAsync: guardarUnidad, isPending } = useApiMutation({
    mutationFn: (payload: UnidadEvaluacionCreateDTO) => crearUnidadEvaluacion(payload),
    onSuccess: () => {
      notify({
        title: 'Unidad creada',
        description: 'La unidad de evaluación se registró correctamente.',
        variant: 'success',
      })
      navigate('/evaluaciones')
    },
    onError: (error) => {
      notify({
        title: 'Error al crear unidad',
        description: getErrorMessage(error, 'No fue posible registrar la unidad de evaluación.'),
        variant: 'error',
      })
    },
  })

  const onSubmit = async (values: UnidadFormValues) => {
    await guardarUnidad(values as UnidadEvaluacionCreateDTO)
  }

  return (
    <Page
      title="Nueva unidad de evaluación"
      description="Configura una unidad para asociarla a una oferta de curso."
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
          <Input
            label="Oferta (UUID)"
            placeholder="00000000-0000-0000-0000-000000000000"
            {...methods.register('ofertaId')}
            error={methods.formState.errors.ofertaId?.message}
          />
          <Input
            label="Nombre de la unidad"
            placeholder="Ej. Unidad 1"
            maxLength={25}
            {...methods.register('nombre')}
            error={methods.formState.errors.nombre?.message}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/evaluaciones')}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending}>
              Registrar unidad
            </Button>
          </div>
        </form>
      </FormProvider>
    </Page>
  )
}

export default UnidadesForm
