import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Input from '@/components/form/Input'
import { useToast } from '@/components/ui/Toast'
import { useApiMutation, useApiQuery } from '@/hooks'
import { isApiError } from '@/api/types'
import type { CursoCatalogo } from '@/contract/moduleB'
import { createCursoCatalogo, getCursoCatalogo, updateCursoCatalogo } from '@/services/cursosCatalogo'
import { cursoCatalogoSchema } from '@/validation/schemas'

type CursoCatalogoFormValues = z.infer<typeof cursoCatalogoSchema>

type SaveCursoCatalogoPayload = {
  id?: string
  values: CursoCatalogoFormValues
}

type CursoCatalogoFormLocationState = {
  returnTo?: { path: string; state?: Record<string, unknown> }
}

const normalizeOptional = (value?: string | null) =>
  value && value.trim().length > 0 ? value.trim() : undefined

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const CursoCatalogoForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation() as unknown as { state?: CursoCatalogoFormLocationState }
  const { notify } = useToast()

  const isEdit = Boolean(id)
  const returnTo = location.state?.returnTo

  const navigateBack = (nextState?: Record<string, unknown>) => {
    if (returnTo?.path) {
      const mergedState = nextState !== undefined ? { ...(returnTo.state ?? {}), ...nextState } : returnTo.state
      navigate(returnTo.path, { replace: true, state: mergedState })
      return
    }
    navigate('/cursos')
  }

  const methods = useForm<CursoCatalogoFormValues>({
    resolver: zodResolver(cursoCatalogoSchema),
    defaultValues: { nombre: '', nivelCurso: '', duracion: '' },
  })

  const { data: curso, isLoading: isLoadingCurso, error: cursoError } = useApiQuery<CursoCatalogo>({
    queryKey: ['cursoCatalogo', id],
    queryFn: () => getCursoCatalogo(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!curso) return
    methods.reset({
      nombre: curso.nombre,
      nivelCurso: curso.nivelCurso ?? '',
      duracion: curso.duracion ?? '',
    })
  }, [curso, methods])

  const { mutateAsync: saveCurso, isPending: isSaving } = useApiMutation({
    mutationFn: ({ id: cursoId, values }: SaveCursoCatalogoPayload) =>
      cursoId
        ? updateCursoCatalogo(cursoId, {
            nombre: values.nombre.trim(),
            nivelCurso: normalizeOptional(values.nivelCurso),
            duracion: normalizeOptional(values.duracion),
          })
        : createCursoCatalogo({
            nombre: values.nombre.trim(),
            nivelCurso: normalizeOptional(values.nivelCurso),
            duracion: normalizeOptional(values.duracion),
          }),
    onSuccess: (cursoResponse, variables) => {
      const editing = Boolean(variables.id)
      notify({
        title: editing ? 'Curso actualizado' : 'Curso creado',
        description: editing ? 'Se actualizaron los datos del curso.' : 'Se registró el curso en el catálogo.',
        variant: 'success',
      })
      const nextState = editing ? undefined : { cursoCreadoId: cursoResponse.id, cursoCreadoNombre: cursoResponse.nombre }
      navigateBack(nextState)
    },
    onError: (error) => {
      notify({ title: 'Error al guardar', description: getErrorMessage(error, 'No fue posible guardar los datos.'), variant: 'error' })
    },
  })

  const onSubmit = async (values: CursoCatalogoFormValues) => {
    await saveCurso({ id, values })
  }

  if (isLoadingCurso) {
    return (
      <Page title="" description="">
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
              <span className="text-lg font-bold text-white">{isEdit ? 'EC' : 'NC'}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar curso' : 'Nuevo curso'}
              </h1>
              <p className="mt-1 text-gray-600">
                {isEdit ? 'Actualiza la información del curso.' : 'Registra un nuevo curso en el catálogo.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center py-16">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Cargando información del curso...</p>
          </div>
        </div>
      </Page>
    )
  }

  if (cursoError) {
    return (
      <Page title="" description="">
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
              <span className="text-lg font-bold text-white">{isEdit ? 'EC' : 'NC'}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar curso' : 'Nuevo curso'}</h1>
              <p className="mt-1 text-gray-600">{isEdit ? 'Actualiza la información del curso.' : 'Registra un nuevo curso en el catálogo.'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Error al cargar</h3>
          <p className="mb-6 text-gray-600">
            {getErrorMessage(cursoError, 'No fue posible cargar el curso.')}
          </p>
          <Button variant="secondary" onClick={() => navigateBack()}>
            Volver al listado
          </Button>
        </div>
      </Page>
    )
  }

  return (
    <Page title="" description="">
      {/* Header con paleta anterior */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
            <span className="text-lg font-bold text-white">{isEdit ? 'EC' : 'NC'}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar curso' : 'Nuevo curso'}</h1>
            <p className="mt-1 text-gray-600">
              {isEdit ? 'Actualiza la información del curso existente.' : 'Completa el formulario para registrar un nuevo curso en el catálogo.'}
            </p>
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <form 
          onSubmit={methods.handleSubmit(onSubmit)} 
          className="mx-auto max-w-2xl space-y-6"
        >
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Información del curso</h2>
              <div className="rounded-full bg-sky-100 px-3 py-1">
                <span className="text-sm font-medium text-sky-700">Datos requeridos</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Placeholder cambiado a “Ej: TAC” */}
              <Input 
                label="Nombre del curso" 
                {...methods.register('nombre')} 
                error={methods.formState.errors.nombre?.message}
                placeholder="Ej: TAC"
                className="rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500/20"
              />
              
              <Input 
                label="Nivel del curso" 
                {...methods.register('nivelCurso')} 
                error={methods.formState.errors.nivelCurso?.message}
                placeholder="Ej: Básico, Intermedio, Avanzado"
                className="rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500/20"
              />
              
              <Input 
                label="Duración" 
                {...methods.register('duracion')} 
                error={methods.formState.errors.duracion?.message}
                placeholder="Ej: 3 meses, 40 horas, 1 semestre"
                className="rounded-xl border-gray-200 focus:border-sky-500 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigateBack()}
              className="px-6 hover:bg-gray-200"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              isLoading={isSaving}
              className="bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-600 px-8 shadow-lg shadow-sky-500/25 hover:from-emerald-600 hover:to-blue-700"
            >
              {isEdit ? (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar cambios
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Crear curso
                </>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Page>
  )
}

export default CursoCatalogoForm