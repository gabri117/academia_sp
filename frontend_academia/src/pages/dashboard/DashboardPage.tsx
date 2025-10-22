// src/pages/dashboard/DashboardPage.tsx
import Page from '../../components/layout/Page'
import Card from '../../components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import { useApiQuery } from '@/hooks'
import { useNavigate } from 'react-router-dom'
import type { Page as PageResult } from '@/contract/pagination'
import type { Alumno } from '@/contract/moduleA'

// ✅ Servicios existentes
import { listAlumnos } from '@/services/alumnos'
import { listOfertasParaCombo } from '@/services/ofertas'
import { listInscripciones } from '@/services/inscripciones'

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------
const pageSize = 100

const normalize = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()

const lower = (s: unknown) => normalize(s).toLowerCase()
const upper = (s: unknown) => normalize(s).toUpperCase()

// Alumnos: activo / programado / en curso
const isAllowedAlumno = (estado: unknown) =>
  new Set(['activo', 'programado', 'en curso']).has(lower(estado))

// Ofertas: PROGRAMADO / EN_CURSO
const isProgramado = (estado: unknown) => upper(estado) === 'PROGRAMADO'
const isEnCurso = (estado: unknown) => upper(estado).replace(/\s+/g, '_') === 'EN_CURSO'

// Inscripciones: solo activas
const isActiva = (estado: unknown) => lower(estado) === 'activo'

// Paginado robusto
async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<PageResult<T>>,
): Promise<T[]> {
  const first = await fetchPage(0)
  const totalPages =
    typeof first.totalPages === 'number' && first.totalPages > 0 ? first.totalPages : 1

  const all: T[] = [...(first.content ?? [])]
  for (let p = 1; p < totalPages; p++) {
    const res = await fetchPage(p)
    all.push(...(res.content ?? []))
    const isLast =
      (res as any)?.last === true ||
      (Array.isArray(res.content) && res.content.length < ((res as any)?.size ?? pageSize))
    if (isLast) break
  }
  return all
}

// ----------------------------------------------------
// Queries de métricas
// ----------------------------------------------------
const useCountAlumnosActivos = () =>
  useApiQuery<number>({
    queryKey: ['dashboard', 'count', 'alumnos-activos'],
    queryFn: async () => {
      const all = await fetchAllPages<Alumno>((page) =>
        listAlumnos({ page, size: pageSize, sort: 'nombre,asc' }),
      )
      return all.reduce((acc, a) => (isAllowedAlumno((a as any)?.estado) ? acc + 1 : acc), 0)
    },
  })

const useCountCursosVigentes = () =>
  useApiQuery<number>({
    queryKey: ['dashboard', 'count', 'cursos-vigentes'],
    queryFn: async () => {
      try {
        const mod = await import('@/services/cursosCatalogo')
        const listarCursosParaCombo: (args: { page: number; size: number; sort: string }) => Promise<PageResult<any>> =
          (mod as any).listarCursosParaCombo
        if (typeof listarCursosParaCombo !== 'function') return 0

        const all = await fetchAllPages<any>((page) =>
          listarCursosParaCombo({ page, size: pageSize, sort: 'nombre,asc' }),
        )

        const hasEstadoField = all.some((c) => c && 'estado' in c)
        if (!hasEstadoField) return all.length

        return all.reduce((acc, c) => (isAllowedAlumno((c as any)?.estado) ? acc + 1 : acc), 0)
      } catch {
        return 0
      }
    },
  })

const useCountOfertasProgramadas = () =>
  useApiQuery<number>({
    queryKey: ['dashboard', 'count', 'ofertas-programadas'],
    queryFn: async () => {
      const all = await fetchAllPages<any>((page) =>
        listOfertasParaCombo({ page, size: pageSize, sort: 'fechaInicio,desc' }),
      )
      return all.reduce((acc, o) => {
        const estado = (o as any)?.estado ?? (o as any)?.status
        return isProgramado(estado) ? acc + 1 : acc
      }, 0)
    },
  })

const useCountOfertasEnCurso = () =>
  useApiQuery<number>({
    queryKey: ['dashboard', 'count', 'ofertas-en-curso'],
    queryFn: async () => {
      const all = await fetchAllPages<any>((page) =>
        listOfertasParaCombo({ page, size: pageSize, sort: 'fechaInicio,desc' }),
      )
      return all.reduce((acc, o) => {
        const estado = (o as any)?.estado ?? (o as any)?.status
        return isEnCurso(estado) ? acc + 1 : acc
      }, 0)
    },
  })

const useCountInscripcionesActivas = () =>
  useApiQuery<number>({
    queryKey: ['dashboard', 'count', 'inscripciones-activas'],
    queryFn: async () => {
      const all = await fetchAllPages<any>((page) =>
        listInscripciones({ page, size: pageSize }),
      )
      return all.reduce((acc, it) => {
        const estado = (it as any)?.estado ?? (it as any)?.status
        return isActiva(estado) ? acc + 1 : acc
      }, 0)
    },
  })

// ----------------------------------------------------
// UI: MetricTile clicable
// ----------------------------------------------------
function MetricTile({
  label,
  value,
  isLoading,
  error,
  icon,
  accent = 'blue',
  onClick,
}: {
  label: string
  value: number | null
  isLoading?: boolean
  error?: unknown
  icon: React.ReactNode
  accent?: 'blue' | 'green' | 'orange' | 'indigo'
  onClick?: () => void
}) {
  const ring =
    accent === 'blue'
      ? 'ring-[rgba(0,102,204,0.35)] bg-[rgba(229,242,255,0.6)] text-[#1f3c63]'
      : accent === 'green'
      ? 'ring-[rgba(0,168,107,0.35)] bg-[rgba(231,251,243,0.7)] text-[#0a8c60]'
      : accent === 'orange'
      ? 'ring-[rgba(255,122,0,0.35)] bg-[rgba(255,244,230,0.7)] text-[#8a4b12]'
      : 'ring-[rgba(99,102,241,0.35)] bg-[rgba(238,242,255,0.7)] text-[#3730a3]'

  const clickable = !!onClick && !isLoading && !error

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`rounded-2xl border border-[#e6eefb] bg-white p-4 text-left shadow-[0_12px_32px_-28px_rgba(0,102,204,0.45)] transition-all ${
        clickable
          ? 'hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(0,102,204,0.55)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,102,204,0.35)]'
          : 'opacity-80'
      }`}
      aria-label={`${label}: ${value ?? 0}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${ring}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <dt className="truncate text-xs font-semibold uppercase tracking-wide text-[#667085]">
            {label}
          </dt>
          <dd className="mt-1">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-sm text-[#667085]">Cargando…</span>
              </div>
            ) : error ? (
              <span className="text-sm text-red-600">Error</span>
            ) : (
              <span className="text-2xl font-semibold text-[#1f2937]">{value ?? 0}</span>
            )}
          </dd>
        </div>
        {clickable && (
          <svg
            viewBox="0 0 24 24"
            className="ml-auto h-4 w-4 text-[#667085]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        )}
      </div>
    </button>
  )
}

// Íconos (SVG)
const IconUsers = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconBook = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M20 22H6.5A2.5 2.5 0 0 1 4 19.5V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1z" />
  </svg>
)

const IconTag = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82Z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </svg>
)

const IconClipboard = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1" />
  </svg>
)

import Credits from '../../components/layout/Credits';

const DashboardPage = () => {
  const navigate = useNavigate()

  const {
    data: alumnosActivos,
    isLoading: loadingAlumnos,
    error: errorAlumnos,
    refetch: refetchAlumnos,
  } = useCountAlumnosActivos()

  const {
    data: cursosVigentes,
    isLoading: loadingCursos,
    error: errorCursos,
    refetch: refetchCursos,
  } = useCountCursosVigentes()

  const {
    data: ofertasProgramadas,
    isLoading: loadingOfProg,
    error: errorOfProg,
    refetch: refetchOfProg,
  } = useCountOfertasProgramadas()

  const {
    data: ofertasEnCurso,
    isLoading: loadingOfCurso,
    error: errorOfCurso,
    refetch: refetchOfCurso,
  } = useCountOfertasEnCurso()

  const {
    data: inscripcionesActivas,
    isLoading: loadingInsc,
    error: errorInsc,
    refetch: refetchInsc,
  } = useCountInscripcionesActivas()

  const handleRefreshAll = () => {
    void refetchAlumnos()
    void refetchCursos()
    void refetchOfProg()
    void refetchOfCurso()
    void refetchInsc()
  }

  return (
    <Page
      title="Panel de control"
      description="Resumen general de actividades de la academia."
      actions={
        <button
          onClick={handleRefreshAll}
          className="inline-flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-3 py-1.5 text-sm font-medium text-[#0b3b79] ring-1 ring-inset ring-[#cfe0f7] backdrop-blur-sm hover:bg-[rgba(0,102,204,0.12)]"
          title="Actualizar métricas"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 11a8 8 0 10-1.582 4.418M20 20v-5" />
          </svg>
          Actualizar
        </button>
      }
    >
      {/* Hero con gradiente */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-[#e6eefb] bg-gradient-to-br from-[#0066cc] via-[#3385ff] to-[#60a5fa] p-6 text-white shadow-[0_30px_60px_-40px_rgba(0,102,204,0.8)]">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-24 h-64 w-64 rounded-full bg-[#ffd600]/20 blur-3xl" />
        </div>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
            Dashboard
          </p>
          <h2 className="mt-1 text-2xl font-semibold leading-tight">Indicadores principales</h2>
          <p className="mt-1 text-sm text-white/85">
            Mostrando únicamente elementos en estado <span className="font-semibold">activo</span>,{' '}
            <span className="font-semibold">programado</span> o <span className="font-semibold">en curso</span>.
          </p>
        </div>
      </div>

      <Card title="Indicadores" description="Haz clic en cualquier indicador para ver el detalle filtrado.">
        {/* 2 → 3 → 5 columnas */}
        <dl className="grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-3 xl:grid-cols-5">
          <MetricTile
            label="Alumnos activos"
            value={alumnosActivos ?? 0}
            isLoading={loadingAlumnos}
            error={errorAlumnos}
            icon={IconUsers}
            accent="blue"
            onClick={() => navigate('/alumnos?estado=activo,programado,en%20curso')}
          />
          <MetricTile
            label="Cursos vigentes"
            value={cursosVigentes ?? 0}
            isLoading={loadingCursos}
            error={errorCursos}
            icon={IconBook}
            accent="indigo"
            onClick={() => navigate('/cursos?estado=activo,programado,en%20curso')}
          />
          <MetricTile
            label="Ofertas programadas"
            value={ofertasProgramadas ?? 0}
            isLoading={loadingOfProg}
            error={errorOfProg}
            icon={IconTag}
            accent="orange"
            onClick={() => navigate('/ofertas?estado=PROGRAMADO')}
          />
          <MetricTile
            label="Ofertas en curso"
            value={ofertasEnCurso ?? 0}
            isLoading={loadingOfCurso}
            error={errorOfCurso}
            icon={IconTag}
            accent="orange"
            onClick={() => navigate('/ofertas?estado=EN_CURSO')}
          />
          <MetricTile
            label="Inscripciones activas"
            value={inscripcionesActivas ?? 0}
            isLoading={loadingInsc}
            error={errorInsc}
            icon={IconClipboard}
            accent="green"
            onClick={() => navigate('/inscripciones?estado=activo')}
          />
        </dl>

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#667085]">
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(229,242,255,0.6)] px-2 py-0.5 ring-1 ring-[rgba(0,102,204,0.25)]">
            <span className="h-2 w-2 rounded-full bg-[#3385ff]" />
            Activo
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,244,230,0.7)] px-2 py-0.5 ring-1 ring-[rgba(255,122,0,0.25)]">
            <span className="h-2 w-2 rounded-full bg-[#ff7a00]" />
            Programado
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(231,251,243,0.7)] px-2 py-0.5 ring-1 ring-[rgba(0,168,107,0.25)]">
            <span className="h-2 w-2 rounded-full bg-[#00a86b]" />
            En curso
          </span>
          <span className="ml-auto">Usa “Actualizar” para refrescar las cifras.</span>
        </div>
      </Card>
      <Credits />
    </Page>
  )
}

export default DashboardPage
