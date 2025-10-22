// src/pages/inscripciones/InscripcionesPorAlumno.tsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Table, { type TableColumn } from '@/components/ui/Table'
import { useApiQuery } from '@/hooks'
import { isApiError } from '@/api/types'

import type { Inscripcion, OfertaCurso, CursoCatalogo } from '@/contract/moduleB'
import type { Page as PageResult } from '@/contract/pagination'
import type { Alumno } from '@/contract/moduleA'

import { listInscripcionesByAlumno } from '@/services/inscripciones'
import { listarOfertasParaFiltro } from '@/services/ofertas'
import { listCursosCatalogo } from '@/services/cursosCatalogo'
import { listAlumnos } from '@/services/alumnos'
import { hhmm } from '@/utils/format'

/* ── helpers ──────────────────────────────────────────────────────────── */
const formatDate = (v?: string | null) => (v ? v.slice(0, 10) : '-')
const normalize = (s?: string | null) =>
  (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const badgeBase = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset'
const badgeActivo = 'bg-[#e7fbf3] text-[#0a8c60] ring-[rgba(0,168,107,0.55)]'
const badgeInactivo = 'bg-[#fff4eb] text-[#b3561d] ring-[rgba(255,122,0,0.45)]'

const panelCard =
  'rounded-2xl border border-[#dbe7f7] bg-[rgba(249,250,251,0.82)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(249,250,251,0.7)] shadow-[0_28px_60px_-32px_rgba(0,51,102,0.5)]'
const heroCard =
  'relative rounded-3xl bg-gradient-to-r from-[#0066cc] via-[#3385ff] to-[#00a86b] text-white shadow-[0_28px_60px_-32px_rgba(0,51,102,0.45)]'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error && 'message' in error) {
    const v = (error as { message?: unknown }).message
    if (typeof v === 'string' && v.trim()) return v
  }
  return fallback
}

/* ── página ───────────────────────────────────────────────────────────── */
const InscripcionesPorAlumno = () => {
  const { alumnoId } = useParams<{ alumnoId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // nombre del alumno desde query (?name=Melbyn%20Xutuc) si existe
  const searchParams = new URLSearchParams(location.search)
  const alumnoNombreFromQuery = searchParams.get('name') ?? undefined

  const [alumnoNombre, setAlumnoNombre] = useState<string>(alumnoNombreFromQuery ?? 'Alumno')

  // Inscripciones (array o PageResult)
  const { data: inscData, isLoading, error, refetch } = useApiQuery<PageResult<Inscripcion> | Inscripcion[]>({
    queryKey: ['inscripciones', 'por-alumno', alumnoId],
    queryFn: () => listInscripcionesByAlumno(alumnoId!),
    enabled: Boolean(alumnoId),
  })

  // Catálogos para rotular ofertas
  const { data: ofertasData } = useApiQuery<PageResult<OfertaCurso>>({
    queryKey: ['ofertas-curso', 'dicc', 'alumno', alumnoId],
    queryFn: () => listarOfertasParaFiltro({ page: 0, size: 1000, sort: 'fechaInicio,desc' }),
  })
  const { data: cursosData } = useApiQuery<PageResult<CursoCatalogo>>({
    queryKey: ['cursos-catalogo', 'dicc', 'alumno', alumnoId],
    queryFn: () => listCursosCatalogo({ page: 0, size: 1000, sort: 'nombre,asc' }),
  })

  // Catálogo de alumnos para construir "Nombre Apellido" si hace falta
  const { data: alumnosPage } = useApiQuery<PageResult<Alumno>>({
    queryKey: ['alumnos', 'dicc', alumnoId],
    queryFn: () => listAlumnos({ page: 0, size: 2000, sort: 'nombre,asc' }),
    enabled: !alumnoNombreFromQuery,
  })

  // normalizar datasets
  const inscripciones: Inscripcion[] = useMemo(() => {
    if (!inscData) return []
    return Array.isArray(inscData) ? inscData : (inscData.content ?? [])
  }, [inscData])

  const ofertas = ofertasData?.content ?? []
  const cursos = cursosData?.content ?? []

  const ofertaById = useMemo(() => new Map(ofertas.map((o) => [o.id, o])), [ofertas])
  const cursoNombreById = useMemo(() => new Map(cursos.map((c) => [c.id, c.nombre])), [cursos])

  // 1) Si no viene ?name=…, intenta desde las inscripciones
  useEffect(() => {
    if (alumnoNombreFromQuery || !inscripciones.length) return
    const first = inscripciones[0] as any
    const nombre = (first?.alumnoNombre as string | undefined) ?? (first?.alumno?.nombre as string | undefined)
    const apellido = (first?.alumnoApellido as string | undefined) ?? (first?.alumno?.apellido as string | undefined)
    const combo = [nombre, apellido].filter(Boolean).join(' ').trim()
    if (combo) setAlumnoNombre(combo)
  }, [inscripciones, alumnoNombreFromQuery])

  // 2) Si aún no hay nombre, buscar en catálogo
  useEffect(() => {
    if (alumnoNombreFromQuery || !alumnosPage?.content?.length || !alumnoId) return
    if (alumnoNombre && alumnoNombre !== 'Alumno' && alumnoNombre.trim().includes(' ')) return
    const match = alumnosPage.content.find((a) => a.id === alumnoId)
    if (match) {
      const full = [match.nombre, match.apellido].filter(Boolean).join(' ').trim()
      if (full) setAlumnoNombre(full)
    }
  }, [alumnosPage, alumnoId, alumnoNombre, alumnoNombreFromQuery])

  const labelOferta = (ofertaId: string) => {
    const o = ofertaById.get(ofertaId)
    if (!o) return ofertaId
    const nombreCurso = cursoNombreById.get(o.cursoId) ?? (o as any)?.curso?.nombre ?? 'Curso'
    const dia = o.dia ?? '—'
    const hi = hhmm(o.horaInicio) || '—'
    const hf = hhmm(o.horaFinalizacion) || '—'
    return `${nombreCurso} — ${dia} · ${hi}–${hf}`
  }

  const columns: TableColumn<Inscripcion>[] = [
    {
      key: 'ofertaId',
      header: 'Oferta',
      render: (i) => <span className="text-[#2e2e2e]">{labelOferta(i.ofertaId)}</span>,
    },
    {
      key: 'fechaInscripcion',
      header: 'Fecha de inscripción',
      render: (i) => <span className="whitespace-nowrap text-[#666666]">{formatDate(i.fechaInscripcion)}</span>,
      cellClassName: 'w-0',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (i) => {
        const e = normalize(i.estado) === 'inactivo' ? 'inactivo' : 'activo'
        const cls = e === 'activo' ? `${badgeBase} ${badgeActivo}` : `${badgeBase} ${badgeInactivo}`
        return <span className={cls}>{e[0].toUpperCase() + e.slice(1)}</span>
      },
      cellClassName: 'w-0',
    },
  ]

  const total = inscripciones.length

  /* ── estados de carga/errores ───────────────────────────────────────── */
  if (!alumnoId) {
    return (
      <Page title="Inscripciones por alumno" description="Detalle de inscripciones del alumno.">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Alumno no encontrado.
          <div className="mt-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Inscripciones por alumno" description="Detalle de inscripciones del alumno.">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(error, 'No fue posible cargar las inscripciones.')}
          <div className="mt-3">
            <Button variant="secondary" onClick={() => refetch()}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  /* ── UI ─────────────────────────────────────────────────────────────── */
  return (
    <Page
      title="Inscripciones por alumno"
      description={`Detalle de inscripciones de ${alumnoNombre}`}
      actions={
        <Button variant="secondary" onClick={() => refetch()} disabled={isLoading} title="Recargar datos">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? 'Cargando…' : 'Recargar'}
        </Button>
      }
    >
      {/* Hero / Resumen — único título visible */}
      <div className={`${heroCard} mb-6`}>
        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-30 bg-[radial-gradient(circle_at_top_left,#ffd600,transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-20 bg-[radial-gradient(circle_at_bottom_right,#00a86b,transparent_60%)]" />
        <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {/* Iniciales IA */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066cc] via-[#3385ff] to-[#00a86b] text-base font-bold text-white shadow-[0_18px_36px_-18px_rgba(0,102,204,0.85)]">
              IA
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-semibold leading-tight">Inscripciones de {alumnoNombre}</span>
              <span className="text-sm text-white/85">Detalle de inscripciones asociadas al alumno</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 shadow-inner backdrop-blur-sm">
              <span className="text-xs uppercase tracking-wide text-white/70">Inscripciones</span>
              <p className="mt-1 text-2xl font-semibold text-white">{total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className={`${panelCard} p-0`}>
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <Table
            data={inscripciones}
            columns={columns}
            getRowKey={(i) => i.id}
            emptyMessage="No hay inscripciones registradas para este alumno."
            classNameHeader="bg-[rgba(0,102,204,0.06)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(0,102,204,0.06)] text-[#2e2e2e] uppercase tracking-wide text-[11px] font-semibold"
            classNameRow="transition-colors hover:bg-[rgba(0,102,204,0.08)] odd:bg-[rgba(0,102,204,0.03)]"
            density="comfortable"
          />
        )}
      </div>

      {/* Botón Volver (único, abajo) */}
      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Button>
      </div>
    </Page>
  )
}

export default InscripcionesPorAlumno
