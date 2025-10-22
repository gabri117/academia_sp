// src/pages/inscripciones/InscripcionesForm.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FormProvider,
  useForm,
  Controller,
  type Resolver,
} from 'react-hook-form'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Input from '@/components/form/Input'
import Spinner from '@/components/ui/Spinner'
import NiceSelect from '@/components/ui/NiceSelect'

import { useApiQuery } from '@/hooks'
import { isApiError } from '@/api/types'
import type { Alumno } from '@/contract/moduleA'
import type { OfertaCurso } from '@/contract/moduleB'
import type { Page as PageResult } from '@/contract/pagination'
import { listAlumnosParaCombo } from '@/services/alumnos'
import { listOfertasParaCombo } from '@/services/ofertas'
import { listarCursosParaDiccionario } from '@/services/cursosCatalogo'
import { hhmm, toYYYYMMDD } from '@/utils/format'
import { InscripcionCreateSchema } from '@/validation/schemas'
import { z } from 'zod'

const InscripcionFormSchema = InscripcionCreateSchema.extend({
  estado: z.enum(['activo', 'inactivo']).default('activo'),
})
export type InscripcionFormValues = z.infer<typeof InscripcionFormSchema>

export interface InscripcionesFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<InscripcionFormValues>
  onSubmit: (values: InscripcionFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

type OfertaCursoConNombre = OfertaCurso & {
  cursoNombre?: string | null
  curso?: { nombre?: string | null } | null
}

/* Helpers */
const normalizeText = (v?: string | null) =>
  (v ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const buildOfertaLabel = (oferta: OfertaCurso, cursoNombre?: string | null) => {
  const o = oferta as OfertaCursoConNombre
  const nombreCurso = o.cursoNombre ?? o.curso?.nombre ?? cursoNombre ?? 'Curso'
  return `${nombreCurso}`
}
const buildOfertaHelper = (oferta: OfertaCurso) => {
  const dia = oferta.dia ? `Día: ${oferta.dia}` : 'Día: —'
  const horaInicio = hhmm(oferta.horaInicio) || '—'
  const horaFin = hhmm(oferta.horaFinalizacion) || '—'
  const fechaInicio = oferta.fechaInicio ?? '—'
  return `${dia} · Inicio: ${horaInicio} · Fin: ${horaFin} · Desde: ${fechaInicio}`
}
const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}
const ensureDefaults = (
  base: InscripcionFormValues,
  incoming?: Partial<InscripcionFormValues>,
): InscripcionFormValues => {
  const merged = { ...base, ...(incoming ?? {}) }
  if (!merged.estado) merged.estado = 'activo'
  return merged
}

const InscripcionesForm = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: InscripcionesFormProps) => {
  const navigate = useNavigate()
  const today = useMemo(() => toYYYYMMDD(new Date()), [])

  /* buscadores */
  const [alumnoSearchTerm, setAlumnoSearchTerm] = useState('')
  const [ofertaSearchTerm, setOfertaSearchTerm] = useState('')

  /* popovers & teclado */
  const [showAlumnoSug, setShowAlumnoSug] = useState(false)
  const [showOfertaSug, setShowOfertaSug] = useState(false)
  const [alumnoActive, setAlumnoActive] = useState(0)
  const [ofertaActive, setOfertaActive] = useState(0)
  const alumnoBoxRef = useRef<HTMLDivElement | null>(null)
  const ofertaBoxRef = useRef<HTMLDivElement | null>(null)

  const defaultValues = useMemo<InscripcionFormValues>(
    () => ({
      alumnoId: '',
      ofertaId: '',
      fechaInscripcion: today,
      estado: 'activo',
    }),
    [today],
  )

  const methods = useForm<InscripcionFormValues>({
    resolver: zodResolver(InscripcionFormSchema) as Resolver<InscripcionFormValues>,
    defaultValues: ensureDefaults(defaultValues, initialValues),
  })

  useEffect(() => {
    methods.reset(ensureDefaults(defaultValues, initialValues))
  }, [defaultValues, initialValues, methods])

  /* cerrar popovers al click externo / Escape */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (alumnoBoxRef.current && !alumnoBoxRef.current.contains(t)) setShowAlumnoSug(false)
      if (ofertaBoxRef.current && !ofertaBoxRef.current.contains(t)) setShowOfertaSug(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAlumnoSug(false)
        setShowOfertaSug(false)
      }
    }
    window.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  /* Catálogos */
  const {
    data: alumnosData,
    isLoading: isLoadingAlumnos,
    error: alumnosError,
  } = useApiQuery<PageResult<Alumno>>({
    queryKey: ['alumnos', 'options', 'form-inscripciones'],
    queryFn: () => listAlumnosParaCombo({ page: 0, size: 1000, sort: 'nombre,asc' }),
  })
  const {
    data: ofertasData,
    isLoading: isLoadingOfertas,
    error: ofertasError,
  } = useApiQuery<PageResult<OfertaCurso>>({
    queryKey: ['ofertas-curso', 'options', 'form-inscripciones'],
    queryFn: () => listOfertasParaCombo({ page: 0, size: 1000, sort: 'fechaInicio,desc' }),
  })
  const {
    data: cursosDic,
    isLoading: isLoadingCursos,
    error: cursosError,
  } = useApiQuery({
    queryKey: ['cursos-catalogo', 'diccionario', 'form-inscripciones'],
    queryFn: () => listarCursosParaDiccionario({ size: 2000, useCache: false }),
  })

  const alumnos = alumnosData?.content ?? []
  const ofertas = ofertasData?.content ?? []
  const diccionarioCursos = cursosDic ?? new Map<string, string>()

  /* Opciones alumno (filtrado) */
  const alumnoOptions = useMemo(() => {
    const term = normalizeText(alumnoSearchTerm)
    const base = alumnos
    const filtered = term
      ? base.filter((a) => {
          const nombre = normalizeText(`${a.nombre} ${a.apellido}`)
          const carnet = normalizeText(a.carnet)
          return nombre.includes(term) || carnet.includes(term)
        })
      : base
    return filtered.slice(0, 50).map((a) => ({
      value: a.id,
      label: `${a.nombre} ${a.apellido}`,
      helper: a.carnet ? `Carnet: ${a.carnet}` : undefined,
    }))
  }, [alumnos, alumnoSearchTerm])

  /* Opciones oferta (filtrado) */
  const ofertaOptions = useMemo(() => {
    const term = normalizeText(ofertaSearchTerm)
    const base = ofertas
    const filtered = term
      ? base.filter((o) => {
          const cursoNombre =
            diccionarioCursos.get(o.cursoId) ?? (o as any)?.curso?.nombre ?? 'Curso'
          const label = `${buildOfertaLabel(o, cursoNombre)} ${buildOfertaHelper(o)}`
          return normalizeText(label).includes(term)
        })
      : base
    return filtered.slice(0, 50).map((o) => ({
      value: o.id,
      label: buildOfertaLabel(o, diccionarioCursos.get(o.cursoId)),
      helper: buildOfertaHelper(o),
    }))
  }, [ofertas, ofertaSearchTerm, diccionarioCursos])

  const catalogoError = alumnosError ?? ofertasError ?? cursosError

  /* seleccionar desde sugerencias */
  const handlePickAlumno = (opt: { value: string; label: string }) => {
    methods.setValue('alumnoId', opt.value, { shouldValidate: true, shouldDirty: true })
    setAlumnoSearchTerm(opt.label)
    setShowAlumnoSug(false)
  }
  const handlePickOferta = (opt: { value: string; label: string }) => {
    methods.setValue('ofertaId', opt.value, { shouldValidate: true, shouldDirty: true })
    setOfertaSearchTerm(opt.label)
    setShowOfertaSug(false)
  }

  /* teclado alumno */
  const onAlumnoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAlumnoSug && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setShowAlumnoSug(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAlumnoActive((i) => (i + 1) % Math.max(alumnoOptions.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAlumnoActive((i) =>
        (i - 1 + Math.max(alumnoOptions.length, 1)) % Math.max(alumnoOptions.length, 1),
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = alumnoOptions[alumnoActive]
      if (opt) handlePickAlumno(opt)
    }
  }

  /* teclado oferta */
  const onOfertaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showOfertaSug && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setShowOfertaSug(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOfertaActive((i) => (i + 1) % Math.max(ofertaOptions.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOfertaActive((i) =>
        (i - 1 + Math.max(ofertaOptions.length, 1)) % Math.max(ofertaOptions.length, 1),
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = ofertaOptions[ofertaActive]
      if (opt) handlePickOferta(opt)
    }
  }

  const handleSubmit = methods.handleSubmit(onSubmit)
  const isSubmitting = methods.formState.isSubmitting
  const disableForm = isLoading || isSubmitting

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="grid gap-4 md:max-w-2xl md:grid-cols-2" noValidate>
        {(alumnosData?.totalElements ?? 0) > (alumnosData?.size ?? 0) ||
        (ofertasData?.totalElements ?? 0) > (ofertasData?.size ?? 0) ? (
          <div className="md:col-span-2 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            Escribe para filtrar y usa ↑/↓ + Enter para seleccionar.
          </div>
        ) : null}

        {/* ALUMNO */}
        {isLoadingAlumnos ? (
          <div className="md:col-span-1 rounded-md border border-dashed border-border px-3 py-2 text-sm text-gray-500">
            Cargando alumnos...
          </div>
        ) : alumnosError ? (
          <div className="md:col-span-1 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
            {getErrorMessage(alumnosError, 'No fue posible cargar los alumnos.')}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-2xl border border-[#d5e5fb] bg-[rgba(229,242,255,0.35)] p-4 shadow-[0_16px_32px_-26px_rgba(0,68,140,0.25)]">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="alumno-search">
                Alumno
              </label>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="rounded-full"
                onClick={() => navigate('/alumnos/nuevo?returnTo=/inscripciones/nueva')}
              >
                {/* icono plus */}
                <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                </svg>
                Agregar nuevo alumno
              </Button>
            </div>

            <div ref={alumnoBoxRef} className="relative">
              <input
                id="alumno-search"
                className="w-full rounded-2xl border border-[#d5e5fb] bg-[rgba(230,240,255,0.7)] px-3 py-2 text-sm text-[#1f3c63] shadow-[0_10px_24px_-20px_rgba(0,68,140,0.25)] focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.28)]"
                placeholder="Buscar alumno por nombre o carnet"
                value={alumnoSearchTerm}
                onChange={(e) => {
                  setAlumnoSearchTerm(e.target.value)
                  setShowAlumnoSug(true)
                  setAlumnoActive(0)
                }}
                onFocus={() => setShowAlumnoSug(true)}
                onKeyDown={onAlumnoKeyDown}
                disabled={disableForm}
                autoComplete="off"
                spellCheck={false}
                aria-activedescendant={
                  showAlumnoSug && alumnoOptions[alumnoActive]
                    ? `opt-al-${alumnoOptions[alumnoActive].value}`
                    : undefined
                }
                aria-expanded={showAlumnoSug}
                role="combobox"
              />

              {showAlumnoSug && alumnoOptions.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-60 w/full overflow-auto rounded-xl border border-[#cfe0f8] bg-white shadow-[0_24px_40px_-20px_rgba(31,60,99,0.25)]">
                  <ul role="listbox" className="py-1">
                    {alumnoOptions.slice(0, 8).map((opt, idx) => (
                      <li
                        id={`opt-al-${opt.value}`}
                        key={opt.value}
                        role="option"
                        aria-selected={idx === alumnoActive}
                        className={`cursor-pointer px-3 py-2 text-sm text-[#1f3c63] hover:bg-[rgba(0,102,204,0.08)] ${
                          idx === alumnoActive ? 'bg-[rgba(0,102,204,0.08)]' : ''
                        }`}
                        onMouseEnter={() => setAlumnoActive(idx)}
                        onClick={() => handlePickAlumno(opt)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{opt.label}</span>
                          {opt.helper && (
                            <span className="text-xs text-[#667085]">{opt.helper}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Controller
              name="alumnoId"
              control={methods.control}
              render={({ field }) => (
                <NiceSelect
                  header="Selecciona un alumno"
                  label="Selecciona un alumno"
                  placeholder="Selecciona un alumno"
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  options={alumnoOptions}
                  disabled={disableForm || alumnoOptions.length === 0}
                  error={methods.formState.errors.alumnoId?.message}
                />
              )}
            />
          </div>
        )}

        {/* OFERTA */}
        {isLoadingOfertas || isLoadingCursos ? (
          <div className="md:col-span-1 rounded-md border border-dashed border-border px-3 py-2 text-sm text-gray-500">
            Cargando ofertas...
          </div>
        ) : ofertasError ? (
          <div className="md:col-span-1 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
            {getErrorMessage(ofertasError, 'No fue posible cargar las ofertas.')}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-2xl border border-[#d5e5fb] bg-[rgba(229,242,255,0.35)] p-4 shadow-[0_16px_32px_-26px_rgba(0,68,140,0.25)]">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="oferta-search">
                Oferta
              </label>
            </div>

            <div ref={ofertaBoxRef} className="relative">
              <input
                id="oferta-search"
                className="w-full rounded-2xl border border-[#d5e5fb] bg-[rgba(230,240,255,0.7)] px-3 py-2 text-sm text-[#1f3c63] shadow-[0_10px_24px_-20px_rgba(0,68,140,0.25)] focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.28)]"
                placeholder="Buscar oferta por curso, día u horario"
                value={ofertaSearchTerm}
                onChange={(e) => {
                  setOfertaSearchTerm(e.target.value)
                  setShowOfertaSug(true)
                  setOfertaActive(0)
                }}
                onFocus={() => setShowOfertaSug(true)}
                onKeyDown={onOfertaKeyDown}
                disabled={disableForm}
                autoComplete="off"
                spellCheck={false}
                aria-activedescendant={
                  showOfertaSug && ofertaOptions[ofertaActive]
                    ? `opt-of-${ofertaOptions[ofertaActive].value}`
                    : undefined
                }
                aria-expanded={showOfertaSug}
                role="combobox"
              />

              {showOfertaSug && ofertaOptions.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-[#cfe0f8] bg-white shadow-[0_24px_40px_-20px_rgba(31,60,99,0.25)]">
                  <ul role="listbox" className="py-1">
                    {ofertaOptions.slice(0, 8).map((opt, idx) => (
                      <li
                        id={`opt-of-${opt.value}`}
                        key={opt.value}
                        role="option"
                        aria-selected={idx === ofertaActive}
                        className={`cursor-pointer px-3 py-2 text-sm text-[#1f3c63] hover:bg-[rgba(0,102,204,0.08)] ${
                          idx === ofertaActive ? 'bg-[rgba(0,102,204,0.08)]' : ''
                        }`}
                        onMouseEnter={() => setOfertaActive(idx)}
                        onClick={() => handlePickOferta(opt)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{opt.label}</span>
                          {opt.helper && (
                            <span className="text-xs text-[#667085]">{opt.helper}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Controller
              name="ofertaId"
              control={methods.control}
              render={({ field }) => (
                <NiceSelect
                  header="Todas las ofertas"
                  label="Selecciona una oferta"
                  placeholder="Selecciona una oferta"
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  options={ofertaOptions}
                  disabled={disableForm || ofertaOptions.length === 0}
                  error={methods.formState.errors.ofertaId?.message}
                />
              )}
            />
          </div>
        )}

        {/* FECHA */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#d5e5fb] bg-[rgba(229,242,255,0.35)] p-4 shadow-[0_16px_32px_-26px_rgba(0,68,140,0.25)]">
          <Input
            label="Fecha de inscripción"
            type="date"
            className="rounded-2xl border border-[#d5e5fb] bg-[rgba(230,240,255,0.7)] text-[#1f3c63] focus:border-[#3385ff] focus:ring-[rgba(51,133,255,0.28)]"
            disabled={disableForm}
            {...methods.register('fechaInscripcion')}
            error={methods.formState.errors.fechaInscripcion?.message}
          />
        </div>

        {/* ESTADO */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#d5e5fb] bg-[rgba(229,242,255,0.35)] p-4 shadow-[0_16px_32px_-26px_rgba(0,68,140,0.25)]">
          <Controller
            name="estado"
            control={methods.control}
            render={({ field }) => (
              <NiceSelect
                label="Estado"
                placeholder="Selecciona el estado"
                header="Estado de la inscripción"
                value={field.value}
                onChange={(v) => field.onChange(v)}
                options={[
                  { value: 'activo', label: 'Activo' },
                  { value: 'inactivo', label: 'Inactivo' },
                ]}
                disabled={disableForm}
                error={methods.formState.errors.estado?.message}
              />
            )}
          />
        </div>

        {catalogoError && (
          <div className="md:col-span-2 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            {getErrorMessage(
              catalogoError,
              'No fue posible cargar algunos catálogos. Intenta recargar la página.',
            )}
          </div>
        )}

        <div className="md:col-span-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={disableForm}>
            {/* icono cerrar (x) */}
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={disableForm}>
            {mode === 'edit' ? (
              <>
                {/* icono check */}
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar cambios
              </>
            ) : (
              <>
                {/* icono plus */}
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                </svg>
                Registrar inscripción
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default InscripcionesForm