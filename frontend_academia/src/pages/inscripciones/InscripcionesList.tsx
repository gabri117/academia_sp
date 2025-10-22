// src/pages/inscripciones/InscripcionesList.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { useApiMutation, useApiQuery } from '@/hooks'
import { useAuthStore } from '@/store/auth'
import { isApiError } from '@/api/types'
import type { CursoCatalogo, Inscripcion } from '@/contract/moduleB'
import type { Alumno } from '@/contract/moduleA'
import type { Page as PageResult } from '@/contract/pagination'
import {
  listInscripciones,
  listInscripcionesByAlumno,
  removeInscripcion,
} from '@/services/inscripciones'
import { listAlumnos } from '@/services/alumnos'
import { listCursosCatalogo } from '@/services/cursosCatalogo'
import { listarOfertasParaFiltro } from '@/services/ofertas'
import type { OfertaCurso } from '@/contract/moduleB'
import { hhmm } from '@/utils/format'

/* ───────── estilos utilitarios ───────── */
const chipBase =
  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs md:text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,102,204,0.35)]'
const chipOn =
  'border-transparent bg-[#0066cc] text-white shadow-[0_10px_24px_-12px_rgba(0,102,204,0.75)] hover:bg-[#005bb8]'
const chipOff =
  'border border-[#c6d9f5] bg-white text-[#2e2e2e] hover:border-[#0066cc] hover:text-[#0066cc]'

const badgeBase = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset'
const badgeActivo = 'bg-[#e7fbf3] text-[#0a8c60] ring-[rgba(0,168,107,0.55)]'
const badgeInactivo = 'bg-[#fff4eb] text-[#b3561d] ring-[rgba(255,122,0,0.45)]'

const panelCard =
  'rounded-2xl border border-[#dbe7f7] bg-[rgba(249,250,251,0.82)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(249,250,251,0.7)] shadow-[0_28px_60px_-32px_rgba(0,51,102,0.5)]'
const heroCard =
  'relative rounded-3xl bg-gradient-to-r from-[#0066cc] via-[#3385ff] to-[#00a86b] text-white shadow-[0_28px_60px_-32px_rgba(0,51,102,0.45)]'

/* ───────── helpers ───────── */
const normalizarDia = (value?: string | null) =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const labelDia = (value?: string | null) => {
  switch (normalizarDia(value)) {
    case 'lunes': return 'Lunes'
    case 'martes': return 'Martes'
    case 'miercoles': return 'Miércoles'
    case 'jueves': return 'Jueves'
    case 'viernes': return 'Viernes'
    case 'sabado': return 'Sábado'
    case 'domingo': return 'Domingo'
    default: return value ?? 'Sin día'
  }
}

const pageSizeOptions = [10, 20, 50]
const defaultPageSize = pageSizeOptions[0]
const SORT_OPTIONS = [
  { label: 'Más recientes', value: 'fechaInscripcion,desc' },
  { label: 'Más antiguo', value: 'fechaInscripcion,asc' },
]

const formatDate = (v?: string | null) => (v ? v.slice(0, 10) : '-')

const labelOfertaFiltro = (o: OfertaCurso, cursoNombre?: string) => {
  const nombre = o.cursoNombre ?? cursoNombre ?? 'Curso'
  const diaLabel = labelDia(o.dia)
  const horaInicio = hhmm(o.horaInicio) || '--'
  const horaFin = hhmm(o.horaFinalizacion) || '--'
  return `${nombre} — ${diaLabel} · ${horaInicio}–${horaFin}`
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const WEEKDAY_FILTERS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
]
const WEEKEND_FILTERS = [
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
]

/* ───────── componente ───────── */
const InscripcionesList = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const role = useAuthStore((s) => s.role)

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(defaultPageSize)
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0].value) // 'fechaInscripcion,desc'

  const [filtroOfertaId, setFiltroOfertaId] = useState<string>('')
  const [filtroFechaInicio, setFiltroFechaInicio] = useState<string>('')
  const [filtroFechaFin, setFiltroFechaFin] = useState<string>('')
  const [filtroEstado, setFiltroEstado] = useState<'activo' | 'inactivo' | 'todos'>('activo')
  const [filtroDias, setFiltroDias] = useState<string[]>([])

  const [mostrarDiasExtra, setMostrarDiasExtra] = useState(false)
  const [mostrarRangoFechas, setMostrarRangoFechas] = useState(false)
  const [mostrarOfertas, setMostrarOfertas] = useState(false)
  const ofertaPopoverRef = useRef<HTMLDivElement | null>(null)

  const [conteoAlumno, setConteoAlumno] = useState<Map<string, number>>(new Map())

  /* 👉 Con filtros pedimos un lote grande para mantener orden estable */
  const isClientFiltering =
    Boolean(
      filtroOfertaId ||
      filtroFechaInicio ||
      filtroFechaFin ||
      filtroDias.length > 0 ||
      filtroEstado !== 'todos'
    )

  const effectivePage = isClientFiltering ? 0 : page
  const effectiveSize = isClientFiltering ? 2000 : size
  const { data, isLoading, isFetching, error, refetch } = useApiQuery<PageResult<Inscripcion>>({
    queryKey: ['inscripciones', effectivePage, effectiveSize, sort],
    queryFn: () => listInscripciones({ page: effectivePage, size: effectiveSize, sort }),
  })

  const { mutateAsync: deleteInscripcion, isPending: isDeleting } = useApiMutation({
    mutationFn: (id: string) => removeInscripcion(id),
    onSuccess: () => {
      notify({ title: 'Inscripción eliminada', description: 'Se eliminó la inscripción seleccionada.', variant: 'success' })
      refetch()
    },
    onError: (err) => {
      notify({ title: 'Error al eliminar', description: getErrorMessage(err, 'No fue posible eliminar la inscripción.'), variant: 'error' })
    },
  })

  const { data: alumnosData } = useApiQuery<PageResult<Alumno>>({
    queryKey: ['alumnos', 'options', 'inscripciones'],
    queryFn: () => listAlumnos({ page: 0, size: 1000, sort: 'nombre,asc' }),
  })
  const { data: ofertasData } = useApiQuery<PageResult<OfertaCurso>>({
    queryKey: ['ofertas-curso', 'options', 'inscripciones'],
    queryFn: () => listarOfertasParaFiltro({ page: 0, size: 1000, sort: 'fechaInicio,desc' }),
  })
  const { data: cursosCatalogoData } = useApiQuery<PageResult<CursoCatalogo>>({
    queryKey: ['cursos-catalogo', 'options', 'inscripciones'],
    queryFn: () => listCursosCatalogo({ page: 0, size: 1000, sort: 'nombre,asc' }),
  })

  const alumnos = alumnosData?.content ?? []
  const ofertas = ofertasData?.content ?? []
  const cursosCatalogo = cursosCatalogoData?.content ?? []

  const alumnoMap = useMemo(
    () => new Map(alumnos.map((a) => [a.id, `${a.nombre} ${a.apellido}`.trim()])),
    [alumnos],
  )
  const cursoMap = useMemo(
    () => new Map(cursosCatalogo.map((c) => [c.id, c.nombre])),
    [cursosCatalogo],
  )
  const ofertaDiaMap = useMemo(
    () => new Map(ofertas.map((o) => [o.id, normalizarDia(o.dia)])),
    [ofertas],
  )
  const ofertaLabelMap = useMemo(
    () => new Map(ofertas.map((o) => [o.id, labelOfertaFiltro(o, cursoMap.get(o.cursoId) ?? undefined)])),
    [cursoMap, ofertas],
  )

  const baseInscripciones = data?.content ?? []

  /* Filtro local */
  const filteredInscripciones = useMemo(() => {
    const src = baseInscripciones
    return src.filter((i) => {
      if (filtroOfertaId && i.ofertaId !== filtroOfertaId) return false

      const fecha = i.fechaInscripcion?.slice(0, 10) ?? ''
      if (filtroFechaInicio && (!fecha || fecha < filtroFechaInicio)) return false
      if (filtroFechaFin && (!fecha || fecha > filtroFechaFin)) return false

      if (filtroEstado !== 'todos') {
        const e = (i.estado ?? '').toLowerCase()
        if (e !== filtroEstado) return false
      }

      if (filtroDias.length > 0) {
        const diaNormalizado = ofertaDiaMap.get(i.ofertaId) ?? ''
        if (!diaNormalizado || !filtroDias.includes(diaNormalizado)) return false
      }

      return true
    })
  }, [baseInscripciones, filtroOfertaId, filtroFechaInicio, filtroFechaFin, filtroEstado, filtroDias, ofertaDiaMap])

  const tableData = isClientFiltering ? filteredInscripciones : baseInscripciones

  /* Meta de paginación */
  const meta = useMemo(() => {
    if (!data) return { number: 0, size, totalElements: tableData.length, totalPages: tableData.length ? 1 : 0 }
    if (isClientFiltering) return { number: 0, size: data.size, totalElements: tableData.length, totalPages: tableData.length ? 1 : 0 }
    return { number: data.number, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages }
  }, [data, isClientFiltering, size, tableData.length])

  /* columnas */
  const mostrarColumnaEstado = filtroEstado === 'todos'
  const columns = useMemo<TableColumn<Inscripcion>[]>(() => {
    const base: TableColumn<Inscripcion>[] = [
      {
        key: 'alumnoId',
        header: 'Alumno',
        render: (i) => (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(0,102,204,0.12)] text-[#0066cc] text-xs font-bold">
              {String(alumnoMap.get(i.alumnoId) ?? 'A').trim().slice(0, 2).toUpperCase()}
            </div>
            <span className="truncate font-semibold text-[#2e2e2e]">{alumnoMap.get(i.alumnoId) ?? i.alumnoId}</span>
          </div>
        ),
      },
      {
        key: 'ofertaId',
        header: 'Oferta',
        render: (i) => <span className="text-[#2e2e2e]">{ofertaLabelMap.get(i.ofertaId) ?? i.ofertaId}</span>,
      },
      {
        key: 'fechaInscripcion',
        header: 'Fecha',
        render: (i) => <span className="whitespace-nowrap text-[#666666]">{formatDate(i.fechaInscripcion)}</span>,
        cellClassName: 'w-0',
      },
    ]
    if (mostrarColumnaEstado) {
      base.push({
        key: 'estado',
        header: 'Estado',
        render: (i) => {
          const e = (i.estado ?? '').toLowerCase()
          const isActivo = e === 'activo'
          return <span className={`${badgeBase} ${isActivo ? badgeActivo : badgeInactivo}`}>{e ? e[0].toUpperCase() + e.slice(1) : '—'}</span>
        },
        cellClassName: 'w-0',
      })
    }
    return base
  }, [alumnoMap, ofertaLabelMap, mostrarColumnaEstado])

  /* UX: cerrar popovers */
  useEffect(() => {
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMostrarRangoFechas(false)
        setMostrarOfertas(false)
      }
    }
    const clickOutside = (e: MouseEvent) => {
      const t = e.target as Node
      if (ofertaPopoverRef.current && !ofertaPopoverRef.current.contains(t)) setMostrarOfertas(false)
    }
    window.addEventListener('keydown', closeOnEsc)
    window.addEventListener('mousedown', clickOutside)
    return () => {
      window.removeEventListener('keydown', closeOnEsc)
      window.removeEventListener('mousedown', clickOutside)
    }
  }, [])

  /* conteo por alumno (se mantiene) */
  useEffect(() => {
    const pendientes = Array.from(new Set(tableData.map((i) => i.alumnoId))).filter((id) => !conteoAlumno.has(id))
    if (pendientes.length === 0) return
    let activo = true
    const fetchConteos = async () => {
      for (const alumnoId of pendientes) {
        try {
          const response = await listInscripcionesByAlumno(alumnoId)
          const total = Array.isArray(response)
            ? response.length
            : Array.isArray((response as PageResult<Inscripcion> | undefined)?.content)
              ? (response as PageResult<Inscripcion>).content.length
              : 0
          if (!activo) return
          setConteoAlumno((prev) => {
            const next = new Map(prev)
            next.set(alumnoId, total)
            return next
          })
        } catch {
          if (!activo) return
          setConteoAlumno((prev) => {
            if (prev.has(alumnoId)) return prev
            const next = new Map(prev)
            next.set(alumnoId, 0)
            return next
          })
        }
      }
    }
    void fetchConteos()
    return () => { activo = false }
  }, [conteoAlumno, tableData])

  const handleDelete = async (inscripcion: Inscripcion) => {
    if (role !== 'admin') {
      notify({ title: 'Acción no permitida', description: 'Solo el rol administrador puede eliminar registros.', variant: 'warning' })
      return
    }
    const confirmed = window.confirm(`¿Deseas eliminar la inscripción ${inscripcion.id}?`)
    if (!confirmed) return
    await deleteInscripcion(inscripcion.id)
  }

  /* Etiquetas y handlers de la barra de filtros */
  const weekendKeys = useMemo(() => WEEKEND_FILTERS.map((i) => i.key), [])
  const weekendSelected = filtroDias.some((d) => weekendKeys.includes(d))
  const mostrarSeccionDiasExtra = mostrarDiasExtra || weekendSelected
  const toggleDia = (dia: string) => {
    setFiltroDias((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]))
    setPage(0)
  }

  const formatDateForLabel = (dateValue?: string) => {
    if (!dateValue) return ''
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const rangoFechasLabel = useMemo(() => {
    const inicio = formatDateForLabel(filtroFechaInicio)
    const fin = formatDateForLabel(filtroFechaFin)
    if (inicio && fin) return `${inicio} - ${fin}`
    if (inicio) return `Desde ${inicio}`
    if (fin) return `Hasta ${fin}`
    return 'Selecciona un rango'
  }, [filtroFechaInicio, filtroFechaFin])
  const tieneRangoFechasSeleccionado = Boolean(filtroFechaInicio || filtroFechaFin)
  const limpiarRangoFechas = () => {
    setFiltroFechaInicio('')
    setFiltroFechaFin('')
    setPage(0)
  }

  if (error) {
    return (
      <Page title="Inscripciones" description="Control por alumno y por oferta de curso">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(error, 'No fue posible cargar las inscripciones.')}
          <div className="mt-2">
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              {/* icono recargar */}
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 11a8 8 0 10-1.582 4.418M20 20v-5h-5" />
              </svg>
              Reintentar
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  const totalRegistros = tableData.length
  const filtrosResumenLabel =
    filtroOfertaId || filtroFechaInicio || filtroFechaFin || filtroDias.length > 0
      ? 'Personalizados'
      : filtroEstado === 'inactivo'
        ? 'Inactivos'
        : filtroEstado === 'activo'
          ? 'Activos'
          : 'Sin filtros'
  const filtrosResumenAccent =
    filtrosResumenLabel === 'Sin filtros'
      ? 'text-white'
      : filtrosResumenLabel === 'Personalizados'
        ? 'text-[#ff7a00]'
        : 'text-[#ffd600]'
  const ofertaSeleccionadaLabel = filtroOfertaId ? (ofertaLabelMap.get(filtroOfertaId) ?? filtroOfertaId) : 'Todas las ofertas'

 return (
  <Page
    title="Inscripciones"
    description="Control por alumno y por oferta de curso"
    actions={
      <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
        <Button variant="secondary" onClick={() => refetch()} disabled={isFetching} title="Recargar datos">
          {/* icono recargar */}
          <svg className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 11a8 8 0 10-1.582 4.418M20 20v-5h-5" />
          </svg>
          {isFetching ? 'Actualizando…' : 'Recargar'}
        </Button>
        {role === 'admin' && (
          <Button onClick={() => navigate('/inscripciones/nueva')} title="Crear nueva inscripción">
            {/* icono plus */}
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
            </svg>
            Nueva inscripción
          </Button>
        )}
      </div>
    }
  >
    {/* Resumen superior */}
    <div className={`${heroCard} mb-6`}>
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-30 bg-[radial-gradient(circle_at_top_left,#ffd600,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-20 bg-[radial-gradient(circle_at_bottom_right,#ff7a00,transparent_60%)]" />
      <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 text-white">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Panel de control</span>
          <span className="text-3xl font-semibold leading-tight">Resumen de inscripciones</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 shadow-inner backdrop-blur-sm">
            <span className="text-xs uppercase tracking-wide text-white/70">Registros totales</span>
            <p className="mt-1 text-2xl font-semibold text-white">{totalRegistros}</p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 shadow-inner backdrop-blur-sm">
            <span className="text-xs uppercase tracking-wide text-white/70">Filtros</span>
            <p className={`mt-1 text-sm font-semibold ${filtrosResumenAccent}`}>{filtrosResumenLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/30 bg-[rgba(229,242,255,0.35)] px-4 py-3 shadow-[0_18px_34px_-28px_rgba(255,255,255,0.9)] backdrop-blur-md">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/80">ORDENAR POR FECHA DE INSCRIPCIÓN</span>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {SORT_OPTIONS.map((option) => {
                const selected = option.value === sort
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      selected
                        ? 'border-white bg-white text-[#1f3c63] shadow-[0_10px_22px_-18px_rgba(0,102,204,0.65)]'
                        : 'border-white/60 text-white/80 hover:border-white hover:text-white'
                    }`}
                    onClick={() => {
                      if (sort !== option.value) {
                        setSort(option.value)
                        setPage(0)
                        refetch()
                      }
                      setMostrarOfertas(false)
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* BARRA DE FILTROS */}
    <div className="sticky top-14 z-10">
      <div className={`${panelCard} px-5 py-5`}>
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          {/* Rango de fechas */}
          <div className="md:col-span-4 relative">
            <label className="block text-sm font-semibold text-[#2e2e2e]">Fecha de inscripción</label>
            <button
              type="button"
              className={`mt-2 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-medium shadow-[0_12px_32px_-26px_rgba(0,102,204,0.65)] transition-all focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.35)] ${
                tieneRangoFechasSeleccionado ? 'border-[#7fb3ff] bg-[rgba(229,242,255,0.85)] text-[#1f3c63]' : 'border-[#d8eaff] bg-[rgba(229,242,255,0.45)] text-[#1f3c63]'
              }`}
              onClick={() => setMostrarRangoFechas((prev) => !prev)}
              aria-expanded={mostrarRangoFechas}
            >
              <span className="truncate pr-2">{rangoFechasLabel}</span>
              <span className="text-xs text-[#3385ff]">{mostrarRangoFechas ? '\u25B2' : '\u25BC'}</span>
            </button>

            {mostrarRangoFechas && (
              <div className="absolute left-0 top-full z-20 mt-3 w-full max-w-sm rounded-2xl border border-[#ccdbee] bg-white p-4 shadow-[0_18px_40px_-20px_rgba(0,51,102,0.45)]">
                <div className="grid gap-3 text-sm">
                  <label className="flex flex-col gap-1 text-[#666666]">
                    <span className="font-semibold text-[#2e2e2e]">Desde</span>
                    <input
                      type="date"
                      className="rounded-lg border border-[#ccdbee] bg-white px-3 py-2 text-sm text-[#2e2e2e] shadow-sm transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[rgba(0,102,204,0.35)]"
                      value={filtroFechaInicio}
                      onChange={(e) => { setFiltroFechaInicio(e.target.value); setPage(0) }}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-[#666666]">
                    <span className="font-semibold text-[#2e2e2e]">Hasta</span>
                    <input
                      type="date"
                      className="rounded-lg border border-[#ccdbee] bg-white px-3 py-2 text-sm text-[#2e2e2e] shadow-sm transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[rgba(0,102,204,0.35)]"
                      value={filtroFechaFin}
                      onChange={(e) => { setFiltroFechaFin(e.target.value); setPage(0) }}
                    />
                  </label>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-[#0066cc] hover:underline"
                    onClick={() => { limpiarRangoFechas(); setMostrarRangoFechas(false) }}
                  >
                    Limpiar
                  </button>
                  <Button type="button" variant="secondary" onClick={() => setMostrarRangoFechas(false)}>
                    {/* icono listo/check */}
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Listo
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Oferta */}
          <div className="relative md:col-span-4">
            <label className="block text-sm font-semibold text-[#2e2e2e]">Oferta</label>
            <div ref={ofertaPopoverRef} className="relative mt-2">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-[#bcd6f4] bg-[rgba(229,242,255,0.55)] px-3 py-2 text-sm font-medium text-[#1f3c63] shadow-[0_14px_34px_-26px_rgba(0,102,204,0.6)] transition-all focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.35)]"
                onClick={() => setMostrarOfertas((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={mostrarOfertas}
              >
                <span className="truncate pr-3 text-left">{ofertaSeleccionadaLabel}</span>
                <span className="text-xs text-[#3385ff]">{mostrarOfertas ? '\u25B2' : '\u25BC'}</span>
              </button>

              {mostrarOfertas && (
                <div className="absolute left-0 right-0 z-30 mt-3 max-h-72 overflow-y-auto rounded-2xl border border-[#c7ddfa] bg-white/95 shadow-[0_24px_60px_-32px_rgba(0,51,102,0.55)] backdrop-blur-md">
                  <ul role="listbox" aria-label="Filtrar por oferta" className="py-2">
                    {[{ id: '', label: 'Todas las ofertas' },
                      ...ofertas.map((oferta) => ({
                        id: oferta.id,
                        label: labelOfertaFiltro(oferta, cursoMap.get(oferta.cursoId) ?? undefined),
                      })),
                    ].map((item) => {
                      const selected = item.id === filtroOfertaId
                      return (
                        <li
                          key={item.id || 'todas'}
                          role="option"
                          aria-selected={selected}
                          className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                            selected ? 'bg-[rgba(51,133,255,0.12)] font-semibold text-[#1f3c63]' : 'text-[#2e2e2e] hover:bg-[rgba(51,133,255,0.08)]'
                          }`}
                          onClick={() => {
                            setFiltroOfertaId(item.id)
                            setPage(0)
                            setMostrarOfertas(false)
                          }}
                        >
                          {item.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Estado (chips) */}
          <div className="md:col-span-4">
            <span className="block text-sm font-semibold text-[#2e2e2e]">Estado</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['activo', 'inactivo', 'todos'] as const).map((opt) => {
                const active = filtroEstado === opt
                const label = opt === 'activo' ? 'Activos' : opt === 'inactivo' ? 'Inactivos' : 'Todos'
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`${chipBase} ${active ? chipOn : chipOff}`}
                    onClick={() => { setFiltroEstado(opt); setPage(0) }}
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Días */}
          <div className="md:col-span-12">
            <span className="block text-sm font-semibold text-[#2e2e2e]">Día</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {WEEKDAY_FILTERS.map((dia) => {
                const selected = filtroDias.includes(dia.key)
                return (
                  <button
                    key={dia.key}
                    type="button"
                    className={`${chipBase} ${selected ? chipOn : chipOff}`}
                    onClick={() => toggleDia(dia.key)}
                    aria-pressed={selected}
                  >
                    {dia.label}
                  </button>
                )
              })}
              <button
                type="button"
                className="ml-1 text-sm font-medium text-[#0066cc] hover:underline"
                onClick={() => setMostrarDiasExtra((prev) => !prev)}
              >
                {mostrarDiasExtra ? 'Ocultar fin de semana' : 'Más días'}
              </button>
            </div>

            {mostrarSeccionDiasExtra && (
              <div className="mt-2 flex flex-wrap gap-2">
                {WEEKEND_FILTERS.map((dia) => {
                  const selected = filtroDias.includes(dia.key)
                  return (
                    <button
                      key={dia.key}
                      type="button"
                      className={`${chipBase} ${selected ? chipOn : chipOff}`}
                      onClick={() => toggleDia(dia.key)}
                      aria-pressed={selected}
                    >
                      {dia.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Tabla */}
    <div className={`${panelCard} mt-4 p-0`}>
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <Table
          data={tableData}
          columns={columns}
          getRowKey={(item) => item.id}
          emptyMessage="No hay inscripciones registradas."
          classNameRow="transition-colors hover:bg-[rgba(0,102,204,0.08)] odd:bg-[rgba(0,102,204,0.03)]"
          classNameHeader="bg-[rgba(0,102,204,0.06)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(0,102,204,0.06)] text-[#2e2e2e] uppercase tracking-wide text-[11px] font-semibold"
          density="compact"
          pagination={
            !isClientFiltering
              ? {
                  meta,
                  onPageChange: (nextPage) => setPage(nextPage),
                  onPageSizeChange: (nextSize) => { setSize(nextSize); setPage(0) },
                  pageSizeOptions,
                  isLoading: isLoading || isFetching || isDeleting,
                }
              : undefined
          }
          renderActions={(i) => (
            <div className="flex justify-end gap-2">
              {(conteoAlumno.get(i.alumnoId) ?? 0) >= 2 && (
                <Button variant="secondary" size="sm" onClick={() => navigate(`/inscripciones/alumno/${i.alumnoId}`)}>
                  {/* icono usuario/ojo */}
                  <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver alumno
                </Button>
              )}
              {role === 'admin' && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/inscripciones/${i.id}/editar`)}>
                    {/* icono lápiz */}
                    <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h-5a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L12 14l-4 1 1-4 7.5-7.5z" />
                    </svg>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" isLoading={isDeleting} onClick={() => handleDelete(i)}>
                    {/* icono basura */}
                    <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m3 0V5a2 2 0 012-2h4a2 2 0 012 2v2M4 7h16" />
                    </svg>
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          )}
        />
      )}
    </div>
  </Page>
)

}

export default InscripcionesList