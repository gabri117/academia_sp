import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Input from '../../components/form/Input'
import Select from '../../components/form/Select'
import { useToast } from '../../components/ui/Toast'
import { useApiMutation } from '../../hooks'
import { isApiError } from '../../api/types'
import type { SesionClaseCreateDTO } from '../../contract/moduleC'
import { sesionClaseCreateSchema } from '../../validation/schemas'
import { createSesionClase } from '../../services/sesiones'
import { useOfertaOptions } from '../../hooks/useCatalogOptions'

type SesionFormValues = z.infer<typeof sesionClaseCreateSchema>

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const SesionesForm = () => {
  const navigate = useNavigate()
  const { notify } = useToast()

  const methods = useForm<SesionFormValues>({
    resolver: zodResolver(sesionClaseCreateSchema),
    defaultValues: {
      ofertaId: '',
      fecha: '',
    },
  })

  const { data: ofertaOptions = [], isLoading: isLoadingOfertas } = useOfertaOptions()

  const { mutateAsync: crearSesion, isPending } = useApiMutation({
    mutationFn: (payload: SesionClaseCreateDTO) => createSesionClase(payload),
    onSuccess: () => {
      notify({
        title: 'Sesion creada',
        description: 'La sesion se registro correctamente.',
        variant: 'success',
      })
      navigate('/sesiones')
    },
    onError: (error) => {
      notify({
        title: 'Error al registrar la sesion',
        description: getErrorMessage(error, 'No fue posible registrar la sesion.'),
        variant: 'error',
      })
    },
  })

  const onSubmit = async (values: SesionFormValues) => {
    const payload: SesionClaseCreateDTO = {
      ofertaId: values.ofertaId,
      fecha: values.fecha,
    }
    await crearSesion(payload)
  }

  return (
    <Page
      title="Nueva sesion de clase"
      description="Registra una sesion asociada a una oferta de curso."
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
          <Input
            label="Fecha"
            type="date"
            placeholder="yyyy-MM-dd"
            {...methods.register('fecha')}
            error={methods.formState.errors.fecha?.message}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/sesiones')}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending}>
              Registrar sesion
            </Button>
          </div>
        </form>
      </FormProvider>
    </Page>
  )
}

export default SesionesForm
