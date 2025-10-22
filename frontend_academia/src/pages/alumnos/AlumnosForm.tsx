// src/pages/alumnos/AlumnoForm.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import Input from '../../components/form/Input'
import { useApiMutation, useApiQuery } from '../../hooks'
import { isApiError } from '../../api/types'

import {
  ALUMNO_ESTADO,
  type Alumno,
  type AlumnoEncargado,
  type AlumnoCreateDTO,
  type AlumnoUpdateDTO,
  type Encargado,
  type EncargadoCreateUpdateDTO,
  type Establecimiento,
} from '../../contract/moduleA'
import type { Page as PageResult } from '../../contract/pagination'

import { createAlumno, getAlumno, updateAlumno } from '../../services/alumnos'
import { createEncargado, listEncargados } from '../../services/encargados'
import { listEstablecimientos } from '../../services/establecimientos'
import { alumnoCreateSchema, encargadoSchema } from '../../validation/schemas'
import { createAlumnoEncargado, listEncargadosPorAlumno } from '../../services/alumnoEncargado'

// 🎨 Style kit
import PanelCard from '@/components/kit/PanelCard'
import { Chip } from '@/components/kit/Chip'
import { cls } from '@/components/ui/stylekit'
import NiceSelect from '@/components/ui/NiceSelect'

const formSchema = alumnoCreateSchema
type AlumnoFormValues = z.infer<typeof formSchema>

type SaveAlumnoVariables = {
  id?: string
  values: AlumnoCreateDTO | AlumnoUpdateDTO
}

const normalizeOptional = (value?: string | null) =>
  value && value.trim().length > 0 ? value.trim() : undefined

const formatDate = (value?: string | null) => {
  if (!value) return ''
  return value.length >= 10 ? value.slice(0, 10) : value
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const AlumnoForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const { notify } = useToast()

  // Estado sección Encargado
  const [encargadoMode, setEncargadoMode] = useState<'none' | 'existing' | 'new'>('none')
  const [selectedEncargadoId, setSelectedEncargadoId] = useState<string>('')
  const [nuevoEncargado, setNuevoEncargado] = useState<EncargadoCreateUpdateDTO>({
    nombre: '',
    apellido: '',
    telefono: '',
  })
  const [encargadoSectionError, setEncargadoSectionError] = useState<string | null>(null)
  const [nuevoEncargadoErrors, setNuevoEncargadoErrors] = useState<{
    nombre?: string; apellido?: string; telefono?: string
  }>({})
  const [encargadoSearch, setEncargadoSearch] = useState('')
  const [isProcessingLink, setIsProcessingLink] = useState(false)

  // 🔎 filtro local para establecimientos
  const [establecimientoSearch, setEstablecimientoSearch] = useState('')

  const methods = useForm<AlumnoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      institutoId: '',
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: '',
      carnet: '',
      fechaNacimiento: '',
      estado: 'activo',
    },
  })

  // ---- Queries ----
  const {
    data: alumno,
    isLoading: isLoadingAlumno,
    error: alumnoError,
  } = useApiQuery<Alumno>({
    queryKey: ['alumno', id],
    queryFn: () => getAlumno(id!),
    enabled: Boolean(id),
  })

  const {
    data: establecimientosResponse,
    isLoading: isLoadingEstablecimientos,
    error: establecimientosError,
  } = useApiQuery<PageResult<Establecimiento>>({
    queryKey: ['establecimientos', 'options'],
    queryFn: () => listEstablecimientos({ page: 0, size: 100, sort: 'nombre,asc' }),
  })

  const {
    data: encargadosResponse,
    isLoading: isLoadingEncargados,
    error: encargadosError,
  } = useApiQuery<PageResult<Encargado>>({
    queryKey: ['encargados', 'options'],
    queryFn: () => listEncargados({ page: 0, size: 100, sort: 'nombre,asc' }),
  })

  const {
    data: encargadosVinculados,
    isLoading: isLoadingVinculos,
    error: vinculosError,
    refetch: refetchVinculos,
  } = useApiQuery<AlumnoEncargado[]>({
    queryKey: ['alumno-encargado', id],
    queryFn: () => listEncargadosPorAlumno(id!),
    enabled: Boolean(id),
  })

  // ---- Effects ----
  useEffect(() => {
    if (alumno) {
      methods.reset({
        institutoId: alumno.institutoId,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        telefono: alumno.telefono ?? '',
        direccion: alumno.direccion ?? '',
        carnet: alumno.carnet ?? '',
        fechaNacimiento: formatDate(alumno.fechaNacimiento),
        estado: alumno.estado,
      })
    }
  }, [alumno, methods])

  // ---- Mutations ----
  const { mutateAsync: saveAlumno, isPending: isSavingAlumno } = useApiMutation<Alumno, SaveAlumnoVariables>({
    mutationFn: ({ id: alumnoId, values }) =>
      alumnoId ? updateAlumno(alumnoId, values) : createAlumno(values as AlumnoCreateDTO),
  })

  // ---- Opciones (selects) ----
  const establecimientos = useMemo(() => establecimientosResponse?.content ?? [], [establecimientosResponse])
  const establecimientoOptions = useMemo(
    () => establecimientos.map((item) => ({ label: item.nombre, value: item.institutoId })),
    [establecimientos],
  )

  // ✅ filtrar por texto local para Establecimiento
  const filteredEstablecimientoOptions = useMemo(() => {
    const term = establecimientoSearch.trim().toLowerCase()
    if (!term) return establecimientoOptions
    const filtered = establecimientoOptions.filter(o => o.label.toLowerCase().includes(term))
    // mantener opción seleccionada visible si se filtró fuera
    const current = methods.getValues('institutoId')
    if (current && !filtered.some(o => o.value === current)) {
      const curOpt = establecimientoOptions.find(o => o.value === current)
      if (curOpt) filtered.unshift(curOpt)
    }
    return filtered
  }, [establecimientoOptions, establecimientoSearch, methods])

  const encargadoOptions = useMemo(
    () =>
      (encargadosResponse?.content ?? []).map((encargado) => ({
        label: `${encargado.nombre} ${encargado.apellido}`,
        value: encargado.id,
      })),
    [encargadosResponse],
  )

  const filteredEncargadoOptions = useMemo(() => {
    const term = encargadoSearch.trim().toLowerCase()
    if (!term) return encargadoOptions
    const filtered = encargadoOptions.filter((option) => option.label.toLowerCase().includes(term))
    if (selectedEncargadoId && !filtered.some((option) => option.value === selectedEncargadoId)) {
      const current = encargadoOptions.find((option) => option.value === selectedEncargadoId)
      if (current) filtered.unshift(current)
    }
    return filtered
  }, [encargadoOptions, encargadoSearch, selectedEncargadoId])

  const vinculados = encargadosVinculados ?? []

  // ---- Submit ----
  const onSubmit = async (values: AlumnoFormValues) => {
    setEncargadoSectionError(null)
    setNuevoEncargadoErrors({})

    let nuevoEncargadoPayload: EncargadoCreateUpdateDTO | null = null
    if (encargadoMode === 'existing' && !selectedEncargadoId) {
      setEncargadoSectionError('Selecciona un encargado para vincular.')
      return
    }

    if (encargadoMode === 'new') {
      const candidato: EncargadoCreateUpdateDTO = {
        nombre: nuevoEncargado.nombre.trim(),
        apellido: nuevoEncargado.apellido.trim(),
        telefono: normalizeOptional(nuevoEncargado.telefono) ?? undefined,
      }
      const parsed = encargadoSchema.safeParse(candidato)
      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors
        setNuevoEncargadoErrors({
          nombre: fieldErrors.nombre?.[0],
          apellido: fieldErrors.apellido?.[0],
          telefono: fieldErrors.telefono?.[0],
        })
        return
      }
      nuevoEncargadoPayload = parsed.data
    }

    const payload: AlumnoCreateDTO = {
      institutoId: values.institutoId,
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      telefono: normalizeOptional(values.telefono),
      direccion: normalizeOptional(values.direccion),
      carnet: normalizeOptional(values.carnet),
      fechaNacimiento: normalizeOptional(values.fechaNacimiento),
      estado: values.estado,
    }

    try {
      setIsProcessingLink(true)
      const savedAlumno = await saveAlumno({ id, values: payload })
      const alumnoId = savedAlumno.id

      if (encargadoMode === 'existing' && selectedEncargadoId) {
        const alreadyLinked = vinculados.some((r) => r.encargadoId === selectedEncargadoId)
        if (!alreadyLinked) await createAlumnoEncargado({ alumnoId, encargadoId: selectedEncargadoId })
      } else if (encargadoMode === 'new' && nuevoEncargadoPayload) {
        const creado = await createEncargado(nuevoEncargadoPayload)
        await createAlumnoEncargado({ alumnoId, encargadoId: creado.id })
      }

      if (id) await refetchVinculos()

      const isEdit = Boolean(id)
      notify({
        title: isEdit ? 'Alumno actualizado' : 'Alumno creado',
        description:
          encargadoMode === 'none'
            ? isEdit
              ? 'Los datos del alumno se actualizaron correctamente.'
              : 'Se registró el alumno correctamente.'
            : 'Alumno y encargado fueron guardados correctamente.',
        variant: 'success',
      })
      navigate(returnTo ?? '/alumnos')
    } catch (error) {
      notify({
        title: 'Error al guardar',
        description: getErrorMessage(error, 'No fue posible guardar la información del alumno o del encargado.'),
        variant: 'error',
      })
    } finally {
      setIsProcessingLink(false)
    }
  }

  // ---- Loading / Error ----
  if (isLoadingAlumno) {
    return (
      <Page title="Alumnos" description="Gestión de alumnos">
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      </Page>
    )
  }

  if (alumnoError) {
    return (
      <Page title="Alumnos" description="Gestión de alumnos">
        <div className={`${cls.panelCard} border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {getErrorMessage(alumnoError, 'No fue posible cargar la información del alumno.')}
          <div className="mt-2">
            <Button variant="secondary" onClick={() => navigate('/alumnos')}>
              Volver al listado
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  // ---- Header text ----
  const isEdit = Boolean(id)
  const mainTitle = isEdit ? 'Editar alumno' : 'Nuevo alumno'
  const subtitle = isEdit ? 'Actualiza la información del alumno.' : 'Registra un nuevo alumno.'
  const initials = isEdit ? 'EA' : 'NA'

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
          <Button variant="secondary" onClick={() => navigate(returnTo ?? '/alumnos')}>Cancelar</Button>
          <Button form="alumno-form" type="submit" isLoading={isSavingAlumno || isProcessingLink}>Guardar</Button>
        </div>
      }
    >
      <FormProvider {...methods}>
        <form id="alumno-form" onSubmit={methods.handleSubmit(onSubmit)} className="grid gap-4">
          {/* Datos del alumno (no tapa dropdowns de abajo) */}
          <PanelCard className="px-5 py-5 overflow-visible relative z-30">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#2e2e2e]">Datos del alumno</h3>
              <p className="text-sm text-[#667085]">Información básica y académica.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Establecimiento con filtro */}
              <div className="flex flex-col gap-2">
                <Input
                  label="Buscar establecimiento"
                  value={establecimientoSearch}
                  onChange={(e) => setEstablecimientoSearch(e.target.value)}
                  placeholder="Escribe para filtrar establecimientos"
                  disabled={isLoadingEstablecimientos}
                />
                <Controller
                  name="institutoId"
                  control={methods.control}
                  render={({ field }) => (
                    // Menú más alto que el panel de Encargado
                    <div className="relative z-50">
                      <NiceSelect
                        label="Establecimiento"
                        placeholder={isLoadingEstablecimientos ? 'Cargando...' : 'Selecciona un establecimiento'}
                        value={field.value ?? ''}
                        onChange={(val) => field.onChange(val)}
                        options={[{ value: '', label: 'Selecciona un establecimiento' }, ...filteredEstablecimientoOptions]}
                        disabled={isLoadingEstablecimientos}
                        header="Establecimientos"
                        error={methods.formState.errors.institutoId?.message}
                      />
                    </div>
                  )}
                />
              </div>

              {/* Estado */}
              <Controller
                name="estado"
                control={methods.control}
                render={({ field }) => (
                  <div className="relative z-40">
                    <NiceSelect
                      label="Estado"
                      placeholder="Selecciona un estado"
                      value={field.value ?? ''}
                      onChange={(val) => field.onChange(val)}
                      options={ALUMNO_ESTADO.map((value) => ({ label: value, value }))}
                      header="Estados"
                      error={methods.formState.errors.estado?.message}
                    />
                  </div>
                )}
              />

              <Input label="Nombre" {...methods.register('nombre')} error={methods.formState.errors.nombre?.message} />
              <Input label="Apellido" {...methods.register('apellido')} error={methods.formState.errors.apellido?.message} />
              <Input label="Telefono" {...methods.register('telefono')} error={methods.formState.errors.telefono?.message} />
              <Input label="Direccion" {...methods.register('direccion')} error={methods.formState.errors.direccion?.message} />
              <Input label="Carnet" {...methods.register('carnet')} error={methods.formState.errors.carnet?.message} />
              <Input
                label="Fecha de nacimiento"
                type="date"
                {...methods.register('fechaNacimiento')}
                error={methods.formState.errors.fechaNacimiento?.message}
              />
            </div>
          </PanelCard>

          {/* Encargado (queda por debajo de los dropdowns de arriba) */}
          <PanelCard className="px-5 py-5 overflow-visible relative z-10">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-[#2e2e2e]">Encargado</h3>
              <p className="text-sm text-[#667085]">
                Opcional. Vincula al alumno con un encargado existente o registra uno nuevo sin salir del formulario.
              </p>
            </div>

            {isLoadingVinculos ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-[#667085]">
                <Spinner size="sm" />
                <span>Cargando encargados vinculados...</span>
              </div>
            ) : (encargadosVinculados?.length ?? 0) > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-[#2e2e2e]">Actualmente vinculados:</p>
                <ul className="flex flex-wrap gap-2 text-sm">
                  {(encargadosVinculados ?? []).map((registro) => (
                    <li
                      key={registro.encargadoId}
                      className="flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-inset ring-[#e5e7eb]"
                    >
                      <span className="text-[#374151]">{registro.encargadoNombreCompleto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : id ? (
              <p className="mt-4 text-sm text-[#667085]">Este alumno no tiene encargados vinculados.</p>
            ) : null}

            {/* Chips de modo */}
            <div className="mt-5">
              <span className="block text-sm font-semibold text-[#2e2e2e]">Modo</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {([
                  { val: 'none', label: 'Sin encargado' },
                  { val: 'existing', label: 'Vincular existente' },
                  { val: 'new', label: 'Registrar nuevo encargado' },
                ] as const).map(opt => (
                  <Chip
                    key={opt.val}
                    active={encargadoMode === opt.val}
                    onClick={() => {
                      setEncargadoMode(opt.val)
                      setSelectedEncargadoId('')
                      setEncargadoSectionError(null)
                      setNuevoEncargadoErrors({})
                      setEncargadoSearch('')
                    }}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>

            {encargadoMode === 'existing' && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Input
                    label="Buscar encargado"
                    value={encargadoSearch}
                    onChange={(event) => setEncargadoSearch(event.target.value)}
                    placeholder="Escribe para filtrar encargados"
                    disabled={isLoadingEncargados || encargadoOptions.length === 0}
                  />
                  {/* Menú está por debajo del de Establecimiento, pero sobre el resto */}
                  <div className="relative z-40">
                    <NiceSelect
                      label="Encargado"
                      value={selectedEncargadoId}
                      onChange={(val) => {
                        setSelectedEncargadoId(String(val))
                        setEncargadoSectionError(null)
                        setEncargadoSearch('')
                      }}
                      options={[{ value: '', label: 'Selecciona un encargado' }, ...filteredEncargadoOptions]}
                      placeholder={isLoadingEncargados ? 'Cargando encargados...' : 'Selecciona un encargado'}
                      disabled={isLoadingEncargados || encargadoOptions.length === 0}
                      error={encargadoSectionError ?? undefined}
                      header="Encargados disponibles"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-end gap-1">
                  <p className="text-xs text-[#667085]">
                    Puedes administrar más vínculos desde la sección “Vínculos” en Alumnos.
                  </p>
                  {!isLoadingEncargados && encargadoOptions.length === 0 && (
                    <p className="text-xs text-[#b91c1c]">
                      No hay encargados registrados. Cambia a “Registrar nuevo encargado”.
                    </p>
                  )}
                </div>
              </div>
            )}

            {encargadoMode === 'new' && (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Input
                  label="Nombre"
                  value={nuevoEncargado.nombre}
                  onChange={(event) =>
                    setNuevoEncargado((prev) => {
                      setNuevoEncargadoErrors((errors) => ({ ...errors, nombre: undefined }))
                      return { ...prev, nombre: event.target.value }
                    })
                  }
                  error={nuevoEncargadoErrors.nombre}
                />
                <Input
                  label="Apellido"
                  value={nuevoEncargado.apellido}
                  onChange={(event) =>
                    setNuevoEncargado((prev) => {
                      setNuevoEncargadoErrors((errors) => ({ ...errors, apellido: undefined }))
                      return { ...prev, apellido: event.target.value }
                    })
                  }
                  error={nuevoEncargadoErrors.apellido}
                />
                <Input
                  label="Telefono"
                  value={nuevoEncargado.telefono ?? ''}
                  onChange={(event) =>
                    setNuevoEncargado((prev) => {
                      setNuevoEncargadoErrors((errors) => ({ ...errors, telefono: undefined }))
                      return { ...prev, telefono: event.target.value }
                    })
                  }
                  error={nuevoEncargadoErrors.telefono}
                  hint="Opcional"
                />
              </div>
            )}
            {vinculosError && (
              <p className="mt-3 text-sm text-[#b45309]">
                {getErrorMessage(vinculosError, 'No fue posible cargar los vínculos actuales.')}
              </p>
            )}
          </PanelCard>

          {/* Alertas de datos auxiliares */}
          {establecimientosError && (
            <div className={`${cls.panelCard} border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700`}>
              {getErrorMessage(establecimientosError, 'No fue posible cargar los establecimientos. Usa recargar para intentar de nuevo.')}
            </div>
          )}
          {encargadosError && (
            <div className={`${cls.panelCard} border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700`}>
              {getErrorMessage(encargadosError, 'No fue posible cargar la lista de encargados. Puedes continuar registrando uno nuevo.')}
            </div>
          )}
        </form>
      </FormProvider>
    </Page>
  )
}

export default AlumnoForm
