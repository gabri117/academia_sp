import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import Input from '../../components/form/Input'
import { useApiMutation, useApiQuery } from '../../hooks'
import { isApiError } from '../../api/types'
import type { Nivel, NivelCreateUpdateDTO } from '../../contract/moduleA'
import { createNivel, getNivel, updateNivel } from '../../services/niveles'
import { nivelSchema } from '../../validation/schemas'

// 🎨 Style kit
import PanelCard from '@/components/kit/PanelCard'
import { cls } from '@/components/ui/stylekit'

const formSchema = nivelSchema
type NivelFormValues = z.infer<typeof formSchema>

type SaveNivelVariables = {
  id?: string
  values: NivelCreateUpdateDTO
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const NivelesForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()

  const methods = useForm<NivelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: '' },
  })

  const {
    data: nivel,
    isLoading,
    error,
  } = useApiQuery<Nivel>({
    queryKey: ['nivel', id],
    queryFn: () => getNivel(id!),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (nivel) methods.reset({ nombre: nivel.nombre })
  }, [nivel, methods])

  const { mutateAsync: saveNivel, isPending } = useApiMutation({
    mutationFn: ({ id: nivelId, values }: SaveNivelVariables) =>
      nivelId ? updateNivel(nivelId, values) : createNivel(values),
    onSuccess: (_, variables) => {
      const isEdit = Boolean(variables.id)
      notify({
        title: isEdit ? 'Nivel actualizado' : 'Nivel creado',
        description: isEdit ? 'El nivel se actualizó correctamente.' : 'Se registró el nivel correctamente.',
        variant: 'success',
      })
      navigate('/niveles')
    },
    onError: (err) => {
      notify({
        title: 'Error al guardar',
        description: getErrorMessage(err, 'No fue posible guardar el nivel.'),
        variant: 'error',
      })
    },
  })

  const onSubmit = async (values: NivelFormValues) => {
    const payload: NivelCreateUpdateDTO = { nombre: values.nombre.trim() }
    await saveNivel({ id, values: payload })
  }

  if (isLoading) {
    return (
      <Page title="Niveles" description="Gestión de niveles">
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Niveles" description="Gestión de niveles">
        <div className={`${cls.panelCard} border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {getErrorMessage(error, 'No fue posible cargar la información del nivel.')}
          <div className="mt-2">
            <Button variant="secondary" onClick={() => navigate('/niveles')}>
              Volver al listado
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  const isEdit = Boolean(id)
  const mainTitle = isEdit ? 'Editar nivel' : 'Nuevo nivel'
  const subtitle = isEdit ? 'Actualiza el nivel seleccionado.' : 'Registra un nuevo nivel.'
  const initials = isEdit ? 'EN' : 'NN'

  return (
    <Page
      title={
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#2fb6ff] via-[#2575fc] to-[#1abc9c] text-xs font-bold text-white shadow-[0_12px_28px_-14px_rgba(37,117,252,0.45)]">
            {initials}
          </span>
          <span className="bg-gradient-to-r from-[#2fb6ff] via-[#2575fc] to-[#1abc9c] bg-clip-text text-lg font-semibold text-transparent md:text-xl">
            {mainTitle}
          </span>
        </div>
      }
      description={<span className="text-[13px] text-[#1f3c63]/80">{subtitle}</span>}
      actions={
        <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
          <Button variant="secondary" onClick={() => navigate('/niveles')}>Cancelar</Button>
          <Button form="nivel-form" type="submit" isLoading={isPending}>
            {isEdit ? 'Guardar cambios' : 'Crear nivel'}
          </Button>
        </div>
      }
    >
      <FormProvider {...methods}>
        <form id="nivel-form" onSubmit={methods.handleSubmit(onSubmit)} className="grid gap-4">
          <PanelCard className="px-5 py-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#2e2e2e]">Datos del nivel</h3>
              <p className="text-sm text-[#667085]">Información mínima requerida.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nombre"
                {...methods.register('nombre')}
                error={methods.formState.errors.nombre?.message}
              />
            </div>
          </PanelCard>
        </form>
      </FormProvider>
    </Page>
  )
}

export default NivelesForm
