// src/pages/OfertasList.tsx
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCw, Pencil, Trash2 } from 'lucide-react'

import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import NiceSelect from '@/components/ui/NiceSelect'
import { useToast } from '@/components/ui/Toast'
import { isApiError } from '@/api/types'
import { useApiMutation, useApiQuery } from '@/hooks'
import { useAuthStore } from '@/store/auth'

import type { CursoCatalogo, OfertaCurso, OfertaStatus } from '@/contract/moduleB'
import type { Establecimiento, Grado, UUID } from '@/contract/moduleA'
import type { Page as PageResult } from '@/contract/pagination'

import { listGrados } from '@/services/grados'
import { listEstablecimientos } from '@/services/establecimientos'
import { listCursosCatalogo } from '@/services/cursosCatalogo'
import { listOfertasCurso, removeOfertaCurso } from '@/services/ofertas'

/* ------------------- constantes, tipos y utilidades ------------------- */

const pageSizeOptions = [10, 20, 50]
const defaultPageSize = pageSizeOptions[0]

const SORT = {
  FECHA_DESC: 'fechaInicio,desc',
  FECHA_ASC: 'fechaInicio,asc',
  CAP_DESC: 'capacidad,desc',
  CAP_ASC: 'capacidad,asc',
} as const

const STATUS_LABELS: Record<OfertaStatus, string> = {
  PROGRAMADO: 'Programado',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
} as const

type DayKey = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'
type DiaFiltro = DayKey | 'todos'

const WEEKDAY_OPTIONS = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
] as const

const WEEKEND_OPTIONS = [
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
] as const
const WEEKEND_KEYS: ReadonlyArray<DayKey> = ['sabado', 'domingo']

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

const formatDate = (v?: string | null) => (!v ? '-' : v.slice(0, 10))
const formatTime = (v?: string | null) => (!v ? '-' : v.slice(0, 5))

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

type Filters = {
  gradoId?: UUID
  institutoId?: UUID
  cursoId?: UUID
}

/* -------------------------------- component ------------------------------- */

const OfertasList = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const role = useAuthStore((s) => s.role)

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(defaultPageSize)
  const [sort, setSort] = useState<string>(SORT.FECHA_DESC)

  const [filtroStatus, setFiltroStatus] = useState<OfertaStatus | 'todos'>('todos')
  const [filtroDia, setFiltroDia] = useState<DiaFiltro>('todos')
  const [mostrarDiasExtra, setMostrarDiasExtra] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    gradoId: undefined,
    institutoId: undefined,
    cursoId: undefined,
  })

  const { data, isLoading, isFetching, error, refetch } = useApiQuery<PageResult<OfertaCurso>>({
    queryKey: ['ofertas-curso', page, size, sort, filters],
    queryFn: () =>
      listOfertasCurso({
        page,
        size,
        sort,
        gradoId: filters.gradoId,
        institutoId: filters.institutoId,
        cursoId: filters.cursoId,
      }),
  })

  const { mutateAsync: deleteOferta, isPending: isDeleting } = useApiMutation({
    mutationFn: (id: string) => removeOfertaCurso(id),
    onSuccess: () => {
      notify({ title: 'Oferta eliminada', description: 'Se eliminó la oferta seleccionada.', variant: 'success' })
      refetch()
    },
    onError: (err) => {
      notify({ title: 'Error al eliminar', description: getErrorMessage(err, 'No fue posible eliminar la oferta.'), variant: 'error' })
    },
  })

  // Catálogos
  const { data: gradosData } = useApiQuery<PageResult<Grado>>({
    queryKey: ['grados', 'options'],
    queryFn: () => listGrados(),
  })
  const { data: establecimientosData } = useApiQuery<PageResult<Establecimiento>>({
    queryKey: ['establecimientos', 'options', 'ofertas'],
    queryFn: () => listEstablecimientos({ page: 0, size: 100, sort: 'nombre,asc' }),
  })
  const { data: cursosCatalogoData } = useApiQuery<PageResult<CursoCatalogo>>({
    queryKey: ['cursos-catalogo', 'options'],
    queryFn: () => listCursosCatalogo({ page: 0, size: 100, sort: 'nombre,asc' }),
  })

  const grados = gradosData?.content ?? []
  const establecimientos = establecimientosData?.content ?? []
  const cursosCatalogo = cursosCatalogoData?.content ?? []

  const gradoMap = useMemo(() => new Map(grados.map((g) => [g.gradoId, g.nombre])), [grados])
  const institutoMap = useMemo(() => new Map(establecimientos.map((i) => [i.institutoId, i.nombre])), [establecimientos])
  const cursoMap = useMemo(() => new Map(cursosCatalogo.map((c) => [c.id, c.nombre])), [cursosCatalogo])

  const mostrarColumnaEstado = filtroStatus === 'todos'
  const mostrarColumnaDia = filtroDia === 'todos'

  const columns = useMemo<TableColumn<OfertaCurso>[]>(() => {
    const cols: TableColumn<OfertaCurso>[] = [
      { key: 'cursoId', header: 'Curso', render: (o) => cursoMap.get(o.cursoId) ?? o.cursoId },
      { key: 'gradoId', header: 'Grado', render: (o) => gradoMap.get(o.gradoId) ?? o.gradoId },
      { key: 'institutoId', header: 'Instituto', render: (o) => institutoMap.get(o.institutoId) ?? o.institutoId },
    ]
    if (mostrarColumnaDia) cols.push({ key: 'dia', header: 'Día', render: (o) => labelDia(o.dia) })
    cols.push(
      { key: 'fechaInicio', header: 'Inicio', render: (o) => `${formatDate(o.fechaInicio)} ${formatTime(o.horaInicio)}` },
      { key: 'fechaFinalizacion', header: 'Finalización', render: (o) => `${formatDate(o.fechaFinalizacion)} ${formatTime(o.horaFinalizacion)}` },
      { key: 'capacidad', header: 'Capacidad' },
    )
    if (mostrarColumnaEstado) {
      cols.push({ key: 'status', header: 'Estado', render: (o) => STATUS_LABELS[o.status] ?? o.status })
    }
    return cols
  }, [cursoMap, gradoMap, institutoMap, mostrarColumnaDia, mostrarColumnaEstado])

  const todasLasOfertas = data?.content ?? []
  const ofertasFiltradas = useMemo(
    () =>
      todasLasOfertas.filter((o) => {
        if (filtroStatus !== 'todos' && o.status !== filtroStatus) return false
        if (filtroDia !== 'todos') {
          const dia = normalizarDia(o.dia) as DayKey | ''
          if (dia !== filtroDia) return false
        }
        return true
      }),
    [todasLasOfertas, filtroStatus, filtroDia],
  )

  const isFiltering = filtroStatus !== 'todos' || filtroDia !== 'todos'
  const tableData = isFiltering ? ofertasFiltradas : todasLasOfertas

  const shouldShowWeekendOptions = mostrarDiasExtra || WEEKEND_KEYS.includes(filtroDia as DayKey)
  const diaOptions = useMemo(
    () => [
      { value: 'todos' as const, label: 'Todos los días' },
      ...WEEKDAY_OPTIONS,
      ...(shouldShowWeekendOptions ? WEEKEND_OPTIONS : []),
    ],
    [shouldShowWeekendOptions],
  )

  const paginationMeta = useMemo(() => {
    if (!data) {
      const total = tableData.length
      return { number: page, size, totalElements: total, totalPages: total ? 1 : 0 }
    }
    if (isFiltering) {
      const total = tableData.length
      return { number: 0, size: data.size, totalElements: total, totalPages: total ? 1 : 0 }
    }
    return { number: data.number, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages }
  }, [data, isFiltering, page, size, tableData.length])

  const handleDelete = async (oferta: OfertaCurso) => {
    if (role !== 'admin') {
      notify({ title: 'Acción no permitida', description: 'Solo el rol administrador puede eliminar registros.', variant: 'warning' })
      return
    }
    if (!window.confirm('¿Deseas eliminar la oferta seleccionada?')) return
    await deleteOferta(oferta.id)
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value ? (value as UUID) : undefined }))
    setPage(0)
  }

  const handleStatusFilterChange = (v: string) => {
    setFiltroStatus(v === 'todos' ? 'todos' : (v as OfertaStatus))
    setPage(0)
  }

  const handleDiaFilterChange = (value: string) => {
    const next = (value || 'todos') as DiaFiltro
    setFiltroDia(next)
    setMostrarDiasExtra(WEEKEND_KEYS.includes(next as DayKey))
    setPage(0)
  }

  const toggleDiasExtra = () => {
    setMostrarDiasExtra((prev) => {
      const next = !prev
      if (!next && WEEKEND_KEYS.includes(filtroDia as DayKey)) setFiltroDia('todos')
      return next
    })
  }

  const totalRegistros = isFiltering ? tableData.length : data?.totalElements ?? tableData.length

  /* ---------------- Panel con look uniforme (Inscripciones) ---------------- */
  const PanelDeControl = () => {
    const isActive = (k: string) => sort === k
    return (
      <div className="rounded-[22px] bg-gradient-to-r from-[#23c26b] via-[#3ea4ff] to-[#1fbf7a] p-4 md:p-5 text-white shadow-[0_24px_54px_-28px_rgba(0,100,180,0.45)]">
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/0 p-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">Panel de control</p>
            <h2 className="mt-1 text-[30px] font-bold leading-tight drop-shadow-sm">Resumen de ofertas</h2>
          </div>
          <div className="flex items-center">
            <div className="w-full rounded-xl border border-white/20 bg-white/15 px-5 py-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-widest opacity-90">Registros totales</p>
              <p className="mt-1 text-[20px] font-extrabold">{totalRegistros}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="grid w-full gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-widest opacity-90">Ordenar oferta</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/15 bg-white/10 p-2">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest opacity-90">Fecha inicio</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={isActive(SORT.FECHA_DESC) ? 'primary' : 'secondary'} onClick={() => { setSort(SORT.FECHA_DESC); setPage(0) }}>
                      Más recientes
                    </Button>
                    <Button size="sm" variant={isActive(SORT.FECHA_ASC) ? 'primary' : 'secondary'} onClick={() => { setSort(SORT.FECHA_ASC); setPage(0) }}>
                      Más antiguos
                    </Button>
                  </div>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 p-2">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest opacity-90">Capacidad</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={isActive(SORT.CAP_DESC) ? 'primary' : 'secondary'} onClick={() => { setSort(SORT.CAP_DESC); setPage(0) }}>
                      Mayor a menor
                    </Button>
                    <Button size="sm" variant={isActive(SORT.CAP_ASC) ? 'primary' : 'secondary'} onClick={() => { setSort(SORT.CAP_ASC); setPage(0) }}>
                      Menor a mayor
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ----------------------------------- UI ---------------------------------- */

  if (error) {
    return (
      <Page title="" description="">
        {/* Header con iniciales OC */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-emerald-500 text-white shadow-md">
              <span className="text-sm font-bold">OC</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold leading-6 text-gray-900">Ofertas de curso</h1>
              <p className="text-sm text-gray-500">Gestiona los grupos publicados para el catálogo.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => refetch()}>
              <RotateCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(error, 'No fue posible cargar las ofertas.')}
        </div>
      </Page>
    )
  }

  return (
    <Page title="" description="">
      {/* CABECERA con iniciales OC + íconos */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-emerald-500 text-white shadow-md">
            <span className="text-sm font-bold">OC</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Ofertas de curso</h1>
            <p className="text-sm text-gray-500">Gestiona los grupos publicados para el catálogo.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RotateCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Actualizando…' : 'Recargar'}
          </Button>

          {role === 'admin' && (
            <Button onClick={() => navigate('/ofertas/nueva')}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva oferta
            </Button>
          )}
        </div>
      </div>

      <PanelDeControl />

      {/* Filtros con NiceSelect */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <NiceSelect
          label="Grado"
          header="Grados"
          value={filters.gradoId ?? ''}
          onChange={(v) => handleFilterChange('gradoId', v)}
          options={[
            { value: '', label: 'Todos' },
            ...grados.map((g) => ({ value: g.gradoId, label: g.nombre })),
          ]}
        />

        <NiceSelect
          label="Instituto"
          header="Institutos"
          value={filters.institutoId ?? ''}
          onChange={(v) => handleFilterChange('institutoId', v)}
          options={[
            { value: '', label: 'Todos' },
            ...establecimientos.map((i) => ({ value: i.institutoId, label: i.nombre })),
          ]}
        />

        <NiceSelect
          label="Curso"
          header="Cursos"
          value={filters.cursoId ?? ''}
          onChange={(v) => handleFilterChange('cursoId', v)}
          options={[
            { value: '', label: 'Todos' },
            ...cursosCatalogo.map((c) => ({ value: c.id, label: c.nombre })),
          ]}
        />

        <NiceSelect
          label="Estado"
          header="Estado"
          value={filtroStatus}
          onChange={handleStatusFilterChange}
          options={[
            { value: 'todos', label: 'Todos' },
            ...Object.entries(STATUS_LABELS).map(([k, lbl]) => ({ value: k, label: lbl })),
          ]}
        />

        <NiceSelect
          label="Día"
          header="Días"
          value={filtroDia}
          onChange={handleDiaFilterChange}
          options={diaOptions.map((o) => ({ value: o.value, label: o.label }))}
        />

        <div className="flex items-end">
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={toggleDiasExtra}
          >
            {mostrarDiasExtra ? 'Ocultar días extra' : 'Más días'}
          </button>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <Table
          data={tableData}
          columns={columns}
          getRowKey={(r) => r.id}
          emptyMessage="No hay ofertas registradas."
          density="comfortable"
          classNameHeader="text-[11px]"
          classNameRow="transition-colors hover:bg-[rgba(230,240,255,0.35)]"
          pagination={
            !(filtroStatus !== 'todos' || filtroDia !== 'todos')
              ? {
                  meta: paginationMeta,
                  onPageChange: (p) => setPage(p),
                  onPageSizeChange: (s) => { setSize(s); setPage(0) },
                  pageSizeOptions,
                  isLoading: isLoading || isFetching || isDeleting,
                }
              : undefined
          }
          renderActions={(oferta) =>
            role === 'admin' ? (
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/ofertas/${oferta.id}/editar`)}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isDeleting}
                  onClick={() => handleDelete(oferta)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            ) : null
          }
        />
      )}
    </Page>
  )
}

export default OfertasList