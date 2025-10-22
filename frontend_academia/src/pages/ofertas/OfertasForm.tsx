// src/pages/OfertasForm.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, useForm, type Resolver } from 'react-hook-form'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Input from '@/components/form/Input'
import NiceSelect from '@/components/ui/NiceSelect'
import { useToast } from '@/components/ui/Toast'
import { useApiMutation, useApiQuery } from '@/hooks'
import { isApiError } from '@/api/types'
import type { OfertaCurso } from '@/contract/moduleB'
import type { Establecimiento, Grado, UUID } from '@/contract/moduleA'
import type { Page as PageResult } from '@/contract/pagination'
import { OFERTA_STATUS } from '@/contract/moduleB'
import { getOfertaCurso, createOfertaCurso, updateOfertaCurso } from '@/services/ofertas'
import { listGrados } from '@/services/grados'
import { listEstablecimientos } from '@/services/establecimientos'
import { listarCursosParaCombo } from '@/services/cursosCatalogo'
import type { CursoCatalogoComboItem } from '@/services/cursosCatalogo'
import { OfertaCreateSchema } from '@/validation/schemas'
import { listarNivelesLite } from '@/services/niveles'
import type { NivelesDict } from '@/services/niveles'

type OfertaCursoFormValues = z.infer<typeof OfertaCreateSchema>

type SaveOfertaPayload = {
  id?: UUID
  values: OfertaCursoFormValues
}

type OfertasFormLocationState = {
  cursoCreadoId?: UUID
  cursoCreadoNombre?: string
  institutoCreadoId?: UUID
  institutoCreadoNombre?: string
}

const toApiTime = (v: string) => (v.length === 5 ? `${v}:00` : v)
const normalizeOptional = (v?: string | null) => (v && v.trim().length > 0 ? v.trim() : undefined)

const formatBackendMessage = (message: unknown, fallback: string) => {
  const text = typeof message === 'string' ? message : ''
  if (!text.trim()) return fallback
  if (/uuid/i.test(text)) return 'Revisa los campos seleccionados.'
  return text
}
const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return formatBackendMessage(error.message, fallback)
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const v = (error as { message?: unknown }).message
    return formatBackendMessage(v, fallback)
  }
  return fallback
}

const FALLBACK_LABEL_VALUE = '\u2014'
const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const
const WEEKEND = ['Sábado', 'Domingo'] as const
const MORE_OPTION_VALUE = '__MORE__'
const LESS_OPTION_VALUE = '__LESS__'
const EMPTY_NIVELES_DICT: NivelesDict = new Map()

const normalizeText = (value?: string | null) =>
  value?.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? ''

const labelCurso = (c: CursoCatalogoComboItem) => {
  const nivel = c.nivelCurso ?? FALLBACK_LABEL_VALUE
  const dBase = c.duracion ?? FALLBACK_LABEL_VALUE
  const duracion = typeof dBase === 'string' ? dBase : String(dBase)
  return `${c.nombre} (Nivel: ${nivel} · Duración: ${duracion})`
}
const labelGrado = (g: Grado, nivelesDict: NivelesDict) => {
  const nivelNombre = nivelesDict.get(g.nivelId) ?? FALLBACK_LABEL_VALUE
  return `${g.nombre} (Nivel: ${nivelNombre})`
}
const labelInstituto = (e: Establecimiento) => {
  const jornada = e.jornada ?? FALLBACK_LABEL_VALUE
  return `${e.nombre} \u2014 ${jornada}`
}

const OfertasForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? undefined) as OfertasFormLocationState | undefined
  const { notify } = useToast()

  const methods = useForm<OfertaCursoFormValues>({
    resolver: zodResolver(OfertaCreateSchema) as Resolver<OfertaCursoFormValues>,
    defaultValues: {
      gradoId: '',
      institutoId: '',
      cursoId: '',
      dia: '',
      horaInicio: '',
      horaFinalizacion: '',
      fechaInicio: '',
      fechaFinalizacion: '',
      capacidad: 22,
      status: OFERTA_STATUS[0],
    },
  })

  const [showWeekend, setShowWeekend] = useState(false)
  const [cursoSearchTerm, setCursoSearchTerm] = useState('')
  const [institutoSearchTerm, setInstitutoSearchTerm] = useState('')
  const [pendingCursoId, setPendingCursoId] = useState<UUID | null>(null)
  const [pendingInstitutoId, setPendingInstitutoId] = useState<UUID | null>(null)

  const { data: oferta, isLoading: isLoadingOferta, error: ofertaError } = useApiQuery<OfertaCurso>({
    queryKey: ['oferta-curso', id],
    queryFn: () => getOfertaCurso(id!),
    enabled: Boolean(id),
  })

  const { data: gradosData, isLoading: isLoadingGrados, error: gradosError } = useApiQuery<PageResult<Grado>>({
    queryKey: ['grados', 'options', 'form'],
    queryFn: () => listGrados({ page: 0, size: 200, sort: 'nombre,asc' }),
  })

  const { data: nivelesDict, isLoading: isLoadingNiveles, error: nivelesError } = useApiQuery<NivelesDict>({
    queryKey: ['niveles', 'dict', 'form-ofertas'],
    queryFn: () => listarNivelesLite(),
  })

  const {
    data: establecimientosData,
    isLoading: isLoadingEstablecimientos,
    error: establecimientosError,
    refetch: refetchEstablecimientos,
  } = useApiQuery<PageResult<Establecimiento>>({
    queryKey: ['establecimientos', 'options', 'form-ofertas'],
    queryFn: () => listEstablecimientos({ page: 0, size: 120, sort: 'nombre,asc' }),
  })

  const {
    data: cursosData,
    isLoading: isLoadingCursos,
    error: cursosError,
    refetch: refetchCursos,
  } = useApiQuery<PageResult<CursoCatalogoComboItem>>({
    queryKey: ['cursos-catalogo', 'options', 'form-ofertas'],
    queryFn: () => listarCursosParaCombo({ page: 0, size: 600, sort: 'nombre,asc' }),
  })

  useEffect(() => {
    if (!state) return
    let shouldReset = false

    if (state.cursoCreadoId) {
      setPendingCursoId(state.cursoCreadoId)
      if (state.cursoCreadoNombre) setCursoSearchTerm(state.cursoCreadoNombre)
      void refetchCursos()
      shouldReset = true
    }
    if (state.institutoCreadoId) {
      setPendingInstitutoId(state.institutoCreadoId)
      if (state.institutoCreadoNombre) setInstitutoSearchTerm(state.institutoCreadoNombre)
      void refetchEstablecimientos()
      shouldReset = true
    }

    if (shouldReset) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, navigate, location.pathname, location.search, refetchCursos, refetchEstablecimientos])

  useEffect(() => {
    if (!oferta) return
    methods.reset({
      gradoId: oferta.gradoId,
      institutoId: oferta.institutoId,
      cursoId: oferta.cursoId,
      dia: oferta.dia ?? '',
      horaInicio: oferta.horaInicio ?? '',
      horaFinalizacion: oferta.horaFinalizacion ?? '',
      fechaInicio: oferta.fechaInicio ?? '',
      fechaFinalizacion: oferta.fechaFinalizacion ?? '',
      capacidad: oferta.capacidad,
      status: oferta.status,
    })
  }, [oferta, methods])

  const { mutateAsync: saveOferta, isPending: isSaving } = useApiMutation({
    mutationFn: ({ id: ofertaId, values }: SaveOfertaPayload) => {
      const payload = {
        gradoId: values.gradoId,
        institutoId: values.institutoId,
        cursoId: values.cursoId,
        dia: normalizeOptional(values.dia),
        horaInicio: toApiTime(values.horaInicio),
        horaFinalizacion: toApiTime(values.horaFinalizacion),
        fechaInicio: values.fechaInicio,
        fechaFinalizacion: values.fechaFinalizacion,
        capacidad: values.capacidad,
        status: values.status,
      }
      return ofertaId ? updateOfertaCurso(ofertaId, payload) : createOfertaCurso(payload)
    },
    onSuccess: (_, variables) => {
      const isEdit = Boolean(variables.id)
      notify({
        title: isEdit ? 'Oferta actualizada' : 'Oferta creada',
        description: isEdit ? 'Se actualizaron los datos de la oferta.' : 'Se registró la oferta de curso.',
        variant: 'success',
      })
      navigate('/ofertas')
    },
    onError: (error) => {
      notify({
        title: 'Error al guardar',
        description: getErrorMessage(error, 'No fue posible guardar la oferta.'),
        variant: 'error',
      })
    },
  })

  const diaSeleccionado = methods.watch('dia') ?? ''
  useEffect(() => {
    if (!showWeekend && WEEKEND.includes(diaSeleccionado as (typeof WEEKEND)[number])) {
      setShowWeekend(true)
    }
  }, [diaSeleccionado, showWeekend])

  const onSubmit = async (values: OfertaCursoFormValues) => {
    await saveOferta({ id, values })
  }

  const diaNiceOptions = useMemo(() => {
    const base: { value: string; label: string; disabled?: boolean }[] = [
      { value: '', label: 'Selecciona un día' },
      ...WEEKDAYS.map((d) => ({ value: d, label: d })),
    ]
    if (showWeekend) {
      base.push({ value: '__sep__', label: 'Fin de semana', disabled: true })
      base.push(...WEEKEND.map((d) => ({ value: d, label: d })))
      base.push({ value: LESS_OPTION_VALUE, label: 'Ocultar días extra' })
    } else {
      base.push({ value: MORE_OPTION_VALUE, label: 'Más días' })
    }
    return base
  }, [showWeekend])

  const nivelesMap = useMemo(() => nivelesDict ?? EMPTY_NIVELES_DICT, [nivelesDict])
  const grados = useMemo(() => gradosData?.content ?? [], [gradosData])
  const establecimientos = useMemo(() => establecimientosData?.content ?? [], [establecimientosData])
  const cursos = useMemo(() => cursosData?.content ?? [], [cursosData])

  const filteredCursos = useMemo(() => {
    if (!cursoSearchTerm.trim()) return cursos
    const t = normalizeText(cursoSearchTerm)
    return cursos.filter((c) => normalizeText(labelCurso(c)).includes(t))
  }, [cursoSearchTerm, cursos])
  const cursoSuggestions = useMemo(
    () => filteredCursos.slice(0, 25).map((c) => ({ id: c.id, label: labelCurso(c) })),
    [filteredCursos],
  )
  const cursoSelectOptions = useMemo(
    () => filteredCursos.map((c) => ({ label: labelCurso(c), value: c.id })),
    [filteredCursos],
  )
  const findCursoByTerm = useCallback(
    (term: string) => {
      const n = normalizeText(term)
      if (!n) return undefined
      return cursos.find((c) => normalizeText(labelCurso(c)) === n)
    },
    [cursos],
  )

  const filteredInstitutos = useMemo(() => {
    if (!institutoSearchTerm.trim()) return establecimientos
    const t = normalizeText(institutoSearchTerm)
    return establecimientos.filter((e) => normalizeText(labelInstituto(e)).includes(t))
  }, [institutoSearchTerm, establecimientos])
  const institutoSuggestions = useMemo(
    () => filteredInstitutos.slice(0, 25).map((e) => ({ id: e.institutoId, label: labelInstituto(e) })),
    [filteredInstitutos],
  )
  const institutoSelectOptions = useMemo(
    () => filteredInstitutos.map((e) => ({ label: labelInstituto(e), value: e.institutoId })),
    [filteredInstitutos],
  )
  const findInstitutoByTerm = useCallback(
    (term: string) => {
      const n = normalizeText(term)
      if (!n) return undefined
      return establecimientos.find((e) => normalizeText(labelInstituto(e)) === n)
    },
    [establecimientos],
  )

  const gradoOptions = useMemo(
    () => grados.map((g) => ({ label: labelGrado(g, nivelesMap), value: g.gradoId })),
    [grados, nivelesMap],
  )

  useEffect(() => {
    if (!pendingCursoId) return
    const target = cursos.find((c) => c.id === pendingCursoId)
    if (!target) return
    methods.setValue('cursoId', pendingCursoId, { shouldValidate: true, shouldDirty: true })
    setCursoSearchTerm(labelCurso(target))
    setPendingCursoId(null)
  }, [pendingCursoId, cursos, methods])

  const selectedCursoId = methods.watch('cursoId')
  useEffect(() => {
    if (!selectedCursoId) return
    const match = cursos.find((c) => c.id === selectedCursoId)
    if (!match) return
    const label = labelCurso(match)
    if (normalizeText(cursoSearchTerm) === normalizeText(label)) return
    setCursoSearchTerm(label)
  }, [selectedCursoId, cursos, cursoSearchTerm])

  useEffect(() => {
    if (!pendingInstitutoId) return
    const target = establecimientos.find((e) => e.institutoId === pendingInstitutoId)
    if (!target) return
    methods.setValue('institutoId', pendingInstitutoId, { shouldValidate: true, shouldDirty: true })
    setInstitutoSearchTerm(labelInstituto(target))
    setPendingInstitutoId(null)
  }, [pendingInstitutoId, establecimientos, methods])

  const selectedInstitutoId = methods.watch('institutoId')
  useEffect(() => {
    if (!selectedInstitutoId) return
    const match = establecimientos.find((e) => e.institutoId === selectedInstitutoId)
    if (!match) return
    const label = labelInstituto(match)
    if (normalizeText(institutoSearchTerm) === normalizeText(label)) return
    setInstitutoSearchTerm(label)
  }, [selectedInstitutoId, establecimientos, institutoSearchTerm])

  if (isLoadingOferta) {
    return (
      <Page title="" description="">
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      </Page>
    )
  }

  if (ofertaError) {
    return (
      <Page title="" description="">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(ofertaError, 'No fue posible cargar la oferta.')}
          <div className="mt-3">
            <Button variant="secondary" onClick={() => navigate('/ofertas')}>
              {/* icono volver (x) */}
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Volver al listado
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  const isEdit = Boolean(id)
  const initials = isEdit ? 'EO' : 'NO'
  const mainTitle = isEdit ? 'Editar oferta' : 'Nueva oferta'
  const subtitle = isEdit ? 'Actualiza la oferta seleccionada.' : 'Publica un nuevo grupo para un curso del catálogo.'

  return (
    <Page title="" description="">
      {/* Encabezado con iniciales */}
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#2fb6ff] via-[#2575fc] to-[#1abc9c] text-sm font-bold text-white shadow-[0_14px_30px_-16px_rgba(0,120,255,0.45)]">
          {initials}
        </span>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{mainTitle}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="rounded-2xl border border-[#e6effc] bg-[rgba(240,247,255,0.55)] p-6 shadow-[0_12px_40px_-28px_rgba(10,70,160,0.28)]"
        >
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#3d78d8]">Formulario</p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* IZQUIERDA */}
            <div className="space-y-5 rounded-2xl bg-white/60 p-5 shadow-[0_8px_28px_-24px_rgba(20,100,200,0.25)] backdrop-blur">
              <div className="flex items-center justify-between">
                <label htmlFor="curso-search" className="text-sm font-medium text-gray-700">Curso</label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    navigate('/cursos/nuevo', { state: { returnTo: { path: location.pathname + location.search } } })
                  }
                >
                  {/* icono plus */}
                  <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                  </svg>
                  Agregar curso
                </Button>
              </div>

              {/* Buscador curso */}
              <input
                id="curso-search"
                className="w-full min-h-[52px] rounded-2xl border border-[#d5e5fb] bg-white px-4 py-3.5 text-[16px] text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Buscar curso por nombre o nivel"
                list="curso-suggestions"
                value={cursoSearchTerm}
                onChange={(e) => {
                  const { value } = e.target
                  setCursoSearchTerm(value)
                  if (!value.trim()) {
                    methods.setValue('cursoId', '', { shouldValidate: true, shouldDirty: true })
                    return
                  }
                  const match = findCursoByTerm(value)
                  if (match) {
                    methods.setValue('cursoId', match.id, { shouldValidate: true, shouldDirty: true })
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const first = filteredCursos[0]
                    if (first) {
                      const label = labelCurso(first)
                      setCursoSearchTerm(label)
                      methods.setValue('cursoId', first.id, { shouldValidate: true, shouldDirty: true })
                    }
                  }
                }}
                disabled={isLoadingCursos}
              />
              <datalist id="curso-suggestions">
                {cursoSuggestions.map((c) => (
                  <option key={c.id} value={c.label}>{c.label}</option>
                ))}
              </datalist>

              <Controller
                name="cursoId"
                control={methods.control}
                render={({ field }) => (
                  <NiceSelect
                    label="Selecciona un curso"
                    value={field.value ?? ''}
                    onChange={(val) => {
                      field.onChange(val)
                      if (!val) {
                        setCursoSearchTerm('')
                        return
                      }
                      const selected = cursos.find((c) => c.id === val)
                      if (selected) setCursoSearchTerm(labelCurso(selected))
                    }}
                    disabled={isLoadingCursos || cursoSelectOptions.length === 0}
                    options={[{ value: '', label: 'Selecciona un curso' }, ...cursoSelectOptions]}
                    header="Cursos disponibles"
                    error={methods.formState.errors.cursoId?.message}
                  />
                )}
              />

              <Controller
                name="horaInicio"
                control={methods.control}
                render={({ field }) => (
                  <Input
                    label="Hora de inicio"
                    type="time"
                    value={field.value ? field.value.slice(0, 5) : ''}
                    onChange={(e) => field.onChange(e.target.value ? `${e.target.value}:00` : '')}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    error={methods.formState.errors.horaInicio?.message}
                  />
                )}
              />

              <Input
                label="Fecha de inicio"
                type="date"
                {...methods.register('fechaInicio')}
                error={methods.formState.errors.fechaInicio?.message}
              />

              {/* Capacidad – slider */}
              <Controller
                name="capacidad"
                control={methods.control}
                render={({ field }) => (
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Capacidad</label>
                      <span className="text-sm text-gray-600">
                        {field.value ?? 22} {Number(field.value ?? 22) === 1 ? 'estudiante' : 'estudiantes'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={Number(field.value ?? 22)}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="w-full accent-[#3385ff]"
                    />
                  </div>
                )}
              />
            </div>

            {/* DERECHA */}
            <div className="space-y-5 rounded-2xl bg-white/60 p-5 shadow-[0_8px_28px_-24px_rgba(20,100,200,0.25)] backdrop-blur">
              <NiceSelect
                label="Grado"
                placeholder={isLoadingGrados || isLoadingNiveles ? 'Cargando grados…' : 'Selecciona un grado'}
                value={methods.watch('gradoId') ?? ''}
                onChange={(v) => methods.setValue('gradoId', v as UUID, { shouldDirty: true })}
                options={[{ value: '', label: 'Selecciona un grado' }, ...(
                  (grados ?? []).map((g) => ({ label: labelGrado(g, nivelesMap), value: g.gradoId }))
                )]}
                disabled={isLoadingGrados || isLoadingNiveles}
                header="Grados disponibles"
                error={methods.formState.errors.gradoId?.message}
              />

              <div className="flex items-center justify-between">
                <label htmlFor="instituto-search" className="text-sm font-medium text-gray-700">Instituto</label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    navigate('/establecimientos/nuevo', {
                      state: { returnTo: { path: location.pathname + location.search } },
                    })
                  }
                >
                  {/* icono plus */}
                  <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                  </svg>
                  Agregar instituto
                </Button>
              </div>

              {/* Buscador instituto */}
              <input
                id="instituto-search"
                className="w-full min-h-[52px] rounded-2xl border border-[#d5e5fb] bg-white px-4 py-3.5 text-[16px] text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Buscar instituto por nombre o jornada"
                list="instituto-suggestions"
                value={institutoSearchTerm}
                onChange={(e) => {
                  const { value } = e.target
                  setInstitutoSearchTerm(value)
                  if (!value.trim()) {
                    methods.setValue('institutoId', '', { shouldValidate: true, shouldDirty: true })
                    return
                  }
                  const match = findInstitutoByTerm(value)
                  if (match) {
                    methods.setValue('institutoId', match.institutoId, { shouldValidate: true, shouldDirty: true })
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const first = filteredInstitutos[0]
                    if (first) {
                      const label = labelInstituto(first)
                      setInstitutoSearchTerm(label)
                      methods.setValue('institutoId', first.institutoId, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  }
                }}
                disabled={isLoadingEstablecimientos}
              />
              <datalist id="instituto-suggestions">
                {institutoSuggestions.map((i) => (
                  <option key={i.id} value={i.label}>{i.label}</option>
                ))}
              </datalist>

              <Controller
                name="institutoId"
                control={methods.control}
                render={({ field }) => (
                  <NiceSelect
                    label="Selecciona un instituto"
                    value={field.value ?? ''}
                    onChange={(val) => {
                      field.onChange(val)
                      if (!val) {
                        setInstitutoSearchTerm('')
                        return
                      }
                      const selected = establecimientos.find((e) => e.institutoId === val)
                      if (selected) setInstitutoSearchTerm(labelInstituto(selected))
                    }}
                    disabled={isLoadingEstablecimientos || institutoSelectOptions.length === 0}
                    options={[{ value: '', label: 'Selecciona un instituto' }, ...institutoSelectOptions]}
                    header="Institutos disponibles"
                    error={methods.formState.errors.institutoId?.message}
                  />
                )}
              />

              {/* Día con NiceSelect */}
              <NiceSelect
                label="Día"
                value={methods.watch('dia') ?? ''}
                onChange={(val) => {
                  if (val === MORE_OPTION_VALUE) { setShowWeekend(true); return }
                  if (val === LESS_OPTION_VALUE) {
                    setShowWeekend(false)
                    if (WEEKEND.includes((methods.getValues('dia') ?? '') as (typeof WEEKEND)[number])) {
                      methods.setValue('dia', '')
                    }
                    return
                  }
                  methods.setValue('dia', val)
                }}
                options={diaNiceOptions}
                header="Selecciona un día"
                error={methods.formState.errors.dia?.message}
              />

              <Controller
                name="horaFinalizacion"
                control={methods.control}
                render={({ field }) => (
                  <Input
                    label="Hora de finalización"
                    type="time"
                    value={field.value ? field.value.slice(0, 5) : ''}
                    onChange={(e) => field.onChange(e.target.value ? `${e.target.value}:00` : '')}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    error={methods.formState.errors.horaFinalizacion?.message}
                  />
                )}
              />

              <Input
                label="Fecha de finalización"
                type="date"
                {...methods.register('fechaFinalizacion')}
                error={methods.formState.errors.fechaFinalizacion?.message}
              />

              <NiceSelect
                label="Estado"
                value={methods.watch('status') ?? OFERTA_STATUS[0]}
                onChange={(val) => methods.setValue('status', val as (typeof OFERTA_STATUS)[number], { shouldDirty: true })}
                options={OFERTA_STATUS.map((s) => ({ label: s, value: s }))}
                header="Estados"
              />
            </div>
          </div>

          {(gradosError || establecimientosError || cursosError || nivelesError) && (
            <div className="mt-5 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              {getErrorMessage(
                gradosError ?? establecimientosError ?? cursosError ?? nivelesError,
                'Algunos catálogos no pudieron cargarse. Intenta recargar la página.',
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/ofertas')}>
              {/* icono cerrar (x) */}
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </Button>

            <Button type="submit" isLoading={isSaving}>
              {/* iconos según estado */}
              {isEdit ? (
                <>
                  {/* icono check/guardar */}
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar cambios
                </>
              ) : (
                <>
                  {/* icono publicar/añadir */}
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                  </svg>
                  Publicar oferta
                </>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Page>
  )
}

export default OfertasForm
