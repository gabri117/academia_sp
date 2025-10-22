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
import type { Encargado, EncargadoCreateUpdateDTO } from '../../contract/moduleA'
import { createEncargado, getEncargado, updateEncargado } from '../../services/encargados'
import { encargadoSchema } from '../../validation/schemas'

// 🎨 Style kit
import PanelCard from '@/components/kit/PanelCard'
import { cls } from '@/components/ui/stylekit'

const formSchema = encargadoSchema
type EncargadoFormValues = z.infer<typeof formSchema>

type SaveEncargadoVariables = {
  id?: string
  values: EncargadoCreateUpdateDTO
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const EncargadosForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()

  const methods = useForm<EncargadoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
    },
  })

  const {
    data: encargado,
    isLoading,
    error,
  } = useApiQuery<Encargado>({
    queryKey: ['encargado', id],
    queryFn: () => getEncargado(id!),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (encargado) {
      methods.reset({
        nombre: encargado.nombre,
        apellido: encargado.apellido,
        telefono: encargado.telefono ?? '',
      })
    }
  }, [encargado, methods])

  const { mutateAsync: saveEncargado, isPending } = useApiMutation({
    mutationFn: ({ id: encargadoId, values }: SaveEncargadoVariables) =>
      encargadoId ? updateEncargado(encargadoId, values) : createEncargado(values),
    onSuccess: (_, variables) => {
      const isEdit = Boolean(variables.id)
      notify({
        title: isEdit ? 'Encargado actualizado' : 'Encargado creado',
        description: isEdit
          ? 'Los datos del encargado se actualizaron correctamente.'
          : 'Se registró el encargado correctamente.',
        variant: 'success',
      })
      navigate('/encargados')
    },
    onError: (err) => {
      notify({
        title: 'Error al guardar',
        description: getErrorMessage(err, 'No fue posible guardar la información.'),
        variant: 'error',
      })
    },
  })

  const onSubmit = async (values: EncargadoFormValues) => {
    const payload: EncargadoCreateUpdateDTO = {
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      telefono: values.telefono?.trim() ? values.telefono.trim() : undefined,
    }
    await saveEncargado({ id, values: payload })
  }

  if (isLoading) {
    return (
      <Page title="Encargados" description="Gestión de encargados">
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Encargados" description="Gestión de encargados">
        <div className={`${cls.panelCard} border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {getErrorMessage(error, 'No fue posible cargar los datos del encargado.')}
          <div className="mt-2">
            <Button variant="secondary" onClick={() => navigate('/encargados')}>
              Volver al listado
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  const mainTitle = id ? 'Editar encargado' : 'Nuevo encargado'
  const subtitle = id ? 'Actualiza los datos del encargado.' : 'Registra un nuevo encargado.'

  return (
    <Page
      title={
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#2fb6ff] via-[#2575fc] to-[#1abc9c] text-xs font-bold text-white shadow-[0_12px_28px_-14px_rgba(37,117,252,0.45)]">
            {id ? 'EE' : 'NE'}
          </span>
          <span className="bg-gradient-to-r from-[#2fb6ff] via-[#2575fc] to-[#1abc9c] bg-clip-text text-lg font-semibold text-transparent md:text-xl">
            {mainTitle}
          </span>
        </div>
      }
      description={<span className="text-[13px] text-[#1f3c63]/80">{subtitle}</span>}
      actions={
        <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
          <Button variant="secondary" onClick={() => navigate('/encargados')}>Cancelar</Button>
          <Button form="encargado-form" type="submit" isLoading={isPending}>
            {id ? 'Guardar cambios' : 'Crear encargado'}
          </Button>
        </div>
      }
    >
      <FormProvider {...methods}>
        <form id="encargado-form" onSubmit={methods.handleSubmit(onSubmit)} className="grid gap-4">
          <PanelCard className="px-5 py-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#2e2e2e]">Datos del encargado</h3>
              <p className="text-sm text-[#667085]">Información básica de contacto.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Nombre" {...methods.register('nombre')} error={methods.formState.errors.nombre?.message} />
              <Input label="Apellido" {...methods.register('apellido')} error={methods.formState.errors.apellido?.message} />
              <Input label="Telefono" {...methods.register('telefono')} error={methods.formState.errors.telefono?.message} />
            </div>
          </PanelCard>
        </form>
      </FormProvider>
    </Page>
  )
}

export default EncargadosForm
