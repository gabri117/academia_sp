// src/pages/establecimientos/EstForm.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import Input from '../../components/form/Input'
// ⬇️ combobox con nuevo diseño
import NiceSelect from '@/components/ui/NiceSelect'
import { useApiMutation, useApiQuery } from '../../hooks'
import { isApiError } from '../../api/types'
import { JORNADA, type Establecimiento, type EstablecimientoCreateUpdateDTO } from '../../contract/moduleA'
import { createEstablecimiento, getEstablecimiento, updateEstablecimiento } from '../../services/establecimientos'
import { establecimientoSchema } from '../../validation/schemas'

// 🎨 Style kit
import PanelCard from '@/components/kit/PanelCard'
import { cls } from '@/components/ui/stylekit'

const formSchema = establecimientoSchema

type EstablecimientoFormValues = z.infer<typeof formSchema>
type SaveEstablecimientoVariables = {
  id?: string
  values: EstablecimientoCreateUpdateDTO
}
type EstablecimientoFormLocationState = {
  returnTo?: {
    path: string
    state?: Record<string, unknown>
  }
}

// 🔧 union literal para jornada (evita ensanchar a string)
type Jornada = (typeof JORNADA)[number]

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const EstForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useToast()
  const returnTo = (location.state as EstablecimientoFormLocationState | undefined)?.returnTo

  const navigateBack = (nextState?: Record<string, unknown>) => {
    if (returnTo?.path) {
      const mergedState =
        nextState !== undefined ? { ...(returnTo.state ?? {}), ...nextState } : returnTo.state
      navigate(returnTo.path, { replace: true, state: mergedState })
      return
    }
    navigate('/establecimientos')
  }

  const methods = useForm<EstablecimientoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      nombreDirector: '',
      telefono: '',
      // ✅ respeta el union literal
      jornada: JORNADA[0] as Jornada,
    },
  })

  const {
    data: establecimiento,
    isLoading,
    error,
  } = useApiQuery<Establecimiento>({
    queryKey: ['establecimiento', id],
    queryFn: () => getEstablecimiento(id!),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (establecimiento) {
      methods.reset({
        nombre: establecimiento.nombre,
        direccion: establecimiento.direccion ?? '',
        nombreDirector: establecimiento.nombreDirector ?? '',
        telefono: establecimiento.telefono ?? '',
        jornada: establecimiento.jornada as Jornada,
      })
    }
  }, [establecimiento, methods])

  const { mutateAsync: saveEstablecimiento, isPending } = useApiMutation({
    mutationFn: ({ id: establecimientoId, values }: SaveEstablecimientoVariables) =>
      establecimientoId ? updateEstablecimiento(establecimientoId, values) : createEstablecimiento(values),
    onSuccess: (establecimientoResponse, variables) => {
      const isEdit = Boolean(variables.id)
      notify({
        title: isEdit ? 'Establecimiento actualizado' : 'Establecimiento creado',
        description: isEdit ? 'La información se actualizó correctamente.' : 'Se registró el establecimiento correctamente.',
        variant: 'success',
      })
      const nextState = isEdit
        ? undefined
        : {
            institutoCreadoId: establecimientoResponse.institutoId,
            institutoCreadoNombre: establecimientoResponse.nombre,
          }
      navigateBack(nextState)
    },
    onError: (err) => {
      notify({
        title: 'Error al guardar',
        description: getErrorMessage(err, 'No fue posible guardar la información.'),
        variant: 'error',
      })
    },
  })

  const onSubmit = async (values: EstablecimientoFormValues) => {
    const payload: EstablecimientoCreateUpdateDTO = {
      nombre: values.nombre.trim(),
      direccion: values.direccion?.trim() || undefined,
      nombreDirector: values.nombreDirector?.trim() || undefined,
      telefono: values.telefono?.trim() || undefined,
      jornada: values.jornada, // ✅ ya es "Matutina" | "Vespertina" | "Nocturna"
    }
    await saveEstablecimiento({ id, values: payload })
  }

  if (isLoading) {
    return (
      <Page title="Establecimientos" description="Gestión de sedes">
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Establecimientos" description="Gestión de sedes">
        <div className={`${cls.panelCard} border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {getErrorMessage(error, 'No fue posible cargar la información del establecimiento.')}
          <div className="mt-2">
            <Button variant="secondary" onClick={() => navigateBack()}>
              Volver al listado
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  const mainTitle = id ? 'Editar establecimiento' : 'Nuevo establecimiento'
  const subtitle = id ? 'Actualiza los datos del establecimiento.' : 'Registra un nuevo establecimiento.'

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
          <Button variant="secondary" onClick={() => navigateBack()}>
            Cancelar
          </Button>
          <Button form="establecimiento-form" type="submit" isLoading={isPending}>
            {id ? 'Guardar cambios' : 'Crear establecimiento'}
          </Button>
        </div>
      }
    >
      <FormProvider {...methods}>
        <form id="establecimiento-form" onSubmit={methods.handleSubmit(onSubmit)} className="grid gap-4">
          <PanelCard className="px-5 py-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#2e2e2e]">Datos del establecimiento</h3>
              <p className="text-sm text-[#667085]">Información mínima requerida para registrar la sede.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nombre"
                {...methods.register('nombre')}
                error={methods.formState.errors.nombre?.message}
              />

              {/* ✅ Combobox con estilo NiceSelect y tipos estrictos */}
              <NiceSelect
                label="Jornada"
                value={(methods.watch('jornada') ?? JORNADA[0]) as Jornada}
                onChange={(val) => methods.setValue('jornada', val as Jornada, { shouldDirty: true })}
                options={JORNADA.map((value) => ({ label: value, value }))}
                header="Selecciona una jornada"
                error={methods.formState.errors.jornada?.message}
              />

              <Input
                label="Dirección"
                {...methods.register('direccion')}
                error={methods.formState.errors.direccion?.message}
              />
              <Input
                label="Nombre del director"
                {...methods.register('nombreDirector')}
                error={methods.formState.errors.nombreDirector?.message}
              />
              <Input
                label="Teléfono"
                {...methods.register('telefono')}
                error={methods.formState.errors.telefono?.message}
              />
            </div>
          </PanelCard>
        </form>
      </FormProvider>
    </Page>
  )
}

export default EstForm
