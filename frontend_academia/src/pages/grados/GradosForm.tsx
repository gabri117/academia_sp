import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'
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
import type { Grado, GradoCreateUpdateDTO, Nivel } from '../../contract/moduleA'
import { createGrado, getGrado, updateGrado } from '../../services/grados'
import { listNiveles } from '../../services/niveles'
import { gradoSchema } from '../../validation/schemas'

// 🎨 Style kit
import PanelCard from '@/components/kit/PanelCard'
import { cls } from '@/components/ui/stylekit'
import NiceSelect from '@/components/ui/NiceSelect'

const formSchema = gradoSchema
type GradoFormValues = z.infer<typeof formSchema>

type SaveGradoVariables = {
  id?: string
  values: GradoCreateUpdateDTO
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const GradosForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()

  const methods = useForm<GradoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      nivelId: '',
    },
  })

  const {
    data: grado,
    isLoading: isLoadingGrado,
    error: gradoError,
  } = useApiQuery<Grado>({
    queryKey: ['grado', id],
    queryFn: () => getGrado(id!),
    enabled: Boolean(id),
  })

  const {
    data: niveles,
    isLoading: isLoadingNiveles,
    error: nivelesError,
  } = useApiQuery<Nivel[]>({
    queryKey: ['niveles', 'options'],
    queryFn: () => listNiveles(),
  })

  useEffect(() => {
    if (grado) {
      methods.reset({
        nombre: grado.nombre,
        nivelId: grado.nivelId,
      })
    }
  }, [grado, methods])

  const { mutateAsync: saveGrado, isPending } = useApiMutation({
    mutationFn: ({ id: gradoId, values }: SaveGradoVariables) =>
      gradoId ? updateGrado(gradoId, values) : createGrado(values),
    onSuccess: (_, variables) => {
      const isEdit = Boolean(variables.id)
      notify({
        title: isEdit ? 'Grado actualizado' : 'Grado creado',
        description: isEdit ? 'Se actualizaron los datos correctamente.' : 'Se registró el grado correctamente.',
        variant: 'success',
      })
      navigate('/grados')
    },
    onError: (err) => {
      notify({
        title: 'Error al guardar',
        description: getErrorMessage(err, 'No fue posible guardar el grado.'),
        variant: 'error',
      })
    },
  })

  const onSubmit = async (values: GradoFormValues) => {
    const payload: GradoCreateUpdateDTO = {
      nombre: values.nombre.trim(),
      nivelId: values.nivelId,
    }
    await saveGrado({ id, values: payload })
  }

  if (isLoadingGrado) {
    return (
      <Page title="Grados" description="Gestión de grados">
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      </Page>
    )
  }

  if (gradoError) {
    return (
      <Page title="Grados" description="Gestión de grados">
        <div className={`${cls.panelCard} border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {getErrorMessage(gradoError, 'No fue posible cargar la información del grado.')}
          <div className="mt-2">
            <Button variant="secondary" onClick={() => navigate('/grados')}>
              Volver al listado
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  const isEdit = Boolean(id)
  const mainTitle = isEdit ? 'Editar grado' : 'Nuevo grado'
  const subtitle = isEdit ? 'Actualiza los datos del grado.' : 'Registra un nuevo grado.'
  const initials = isEdit ? 'EG' : 'NG'

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
          <Button variant="secondary" onClick={() => navigate('/grados')}>Cancelar</Button>
          <Button form="grado-form" type="submit" isLoading={isPending}>
            {isEdit ? 'Guardar cambios' : 'Crear grado'}
          </Button>
        </div>
      }
    >
      <FormProvider {...methods}>
        <form id="grado-form" onSubmit={methods.handleSubmit(onSubmit)} className="grid gap-4">
          <PanelCard className="px-5 py-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#2e2e2e]">Datos del grado</h3>
              <p className="text-sm text-[#667085]">Información mínima requerida.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nombre"
                {...methods.register('nombre')}
                error={methods.formState.errors.nombre?.message}
              />

              <Controller
                name="nivelId"
                control={methods.control}
                render={({ field }) => (
                  <NiceSelect
                    label="Nivel"
                    placeholder={isLoadingNiveles ? 'Cargando...' : 'Selecciona un nivel'}
                    value={field.value ?? ''}
                    onChange={(val) => field.onChange(val)}
                    options={[
                      { value: '', label: 'Selecciona un nivel' },
                      ...((niveles ?? []).map((n) => ({ label: n.nombre, value: n.nivelId }))),
                    ]}
                    disabled={isLoadingNiveles}
                    header="Niveles disponibles"
                    error={methods.formState.errors.nivelId?.message}
                  />
                )}
              />
            </div>

            {nivelesError && (
              <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                {getErrorMessage(nivelesError, 'No fue posible cargar la lista de niveles.')}
                <span> Recarga la página o intenta más tarde.</span>
              </div>
            )}
          </PanelCard>
        </form>
      </FormProvider>
    </Page>
  )
}

export default GradosForm
