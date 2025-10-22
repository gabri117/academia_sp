import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  RotateCw,
  Search,
  X,
  ArrowLeft,
  ArrowRight,
  Eye,
  Users,
  Pencil,
  Trash2,
} from 'lucide-react'

import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'

import { isApiError } from '@/api/types'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/auth'
import { useApiMutation, useApiQuery } from '@/hooks'

import type { Alumno, Establecimiento } from '@/contract/moduleA'
import type { Page as PageResult } from '@/contract/pagination'
import { listAlumnos, removeAlumno } from '@/services/alumnos'
import { listEncargadosPorAlumno } from '@/services/alumnoEncargado'
import { listEstablecimientos } from '@/services/establecimientos'

// 🎨 Style kit reutilizable
import HeroSummary from '@/components/kit/HeroSummary'
import PanelCard from '@/components/kit/PanelCard'
import BadgeEstado from '@/components/kit/BadgeEstado'
import { cls } from '@/components/ui/stylekit'

const pageSize = 10

const SORT_OPTIONS = [
  { label: 'Nombre (A-Z)', value: 'nombre,asc' },
  { label: 'Nombre (Z-A)', value: 'nombre,desc' },
  { label: 'Apellido (A-Z)', value: 'apellido,asc' },
  { label: 'Apellido (Z-A)', value: 'apellido,desc' },
]

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

// normaliza: lowercase, trim y sin acentos
const normalize = (s: unknown) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()

// decide si la paginación del backend terminó
const isLastPage = (res: any, pageIndex: number, sizeFallback = pageSize) => {
  if (typeof res?.last === 'boolean') return res.last
  if (typeof res?.totalPages === 'number') return pageIndex >= res.totalPages - 1
  const sz = typeof res?.size === 'number' ? res.size : sizeFallback
  const len = Array.isArray(res?.content) ? res.content.length : 0
  return len < sz
}

const AlumnosList = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const role = useAuthStore((state) => state.role)

  // --- estado normal paginado ---
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState(SORT_OPTIONS[0]?.value ?? 'nombre,asc')

  // --- búsqueda global en cliente ---
  const [searchInput, setSearchInput] = useState('')
  const [globalMode, setGlobalMode] = useState(false)
  const [globalLoading, setGlobalLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [globalResults, setGlobalResults] = useState<Alumno[]>([])
  const [globalTerm, setGlobalTerm] = useState('')

  // --- modal/ver detalles ---
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null)

  // --- chip de vínculos por alumno visible ---
  const [vinculosMapa, setVinculosMapa] = useState<Record<string, number>>({})
  const [isLoadingVinculos, setIsLoadingVinculos] = useState(false)
  const [vinculosFetchError, setVinculosFetchError] = useState<string | null>(null)

  // Paginado normal (deshabilitado en modo global)
  const { data, isLoading, isFetching, error, refetch } = useApiQuery<PageResult<Alumno>>({
    queryKey: ['alumnos', page, sort],
    queryFn: () => listAlumnos({ page, size: pageSize, sort }),
    enabled: !globalMode,
  })

  const { mutateAsync: deleteAlumno, isPending: isDeleting } = useApiMutation({
    mutationFn: (id: string) => removeAlumno(id),
    onSuccess: () => {
      notify({
        title: 'Alumno eliminado',
        description: 'Se eliminó el alumno seleccionado.',
        variant: 'success',
      })
      if (globalMode) {
        void runGlobalSearch(globalTerm)
      } else {
        refetch()
      }
    },
    onError: (err) => {
      notify({
        title: 'Error al eliminar',
        description: getErrorMessage(err, 'Revisa los datos e inténtalo nuevamente.'),
        variant: 'error',
      })
    },
  })

  const totalPages = data?.totalPages ?? 0
  const alumnosData = data?.content ?? []

  // --- establecimientos: para mostrar nombre en tabla ---
  const {
    data: establecimientosPage,
    isLoading: isLoadingEst,
    error: establecimientosError,
  } = useApiQuery<PageResult<Establecimiento>>({
    queryKey: ['establecimientos', 'combo-for-alumnos'],
    queryFn: () => listEstablecimientos({ page: 0, size: 200, sort: 'nombre,asc' }),
  })

  const establecimientosMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const e of (establecimientosPage?.content ?? [])) m.set(e.institutoId, e.nombre)
    return m
  }, [establecimientosPage])

  const getEstName = (institutoId?: string | null) =>
    institutoId ? (establecimientosMap.get(institutoId) ?? institutoId) : '-'

  // --- función robusta: carga todas las páginas
  const fetchAllAlumnos = async (currentSort: string) => {
    const MAX_PAGES = 500
    let all: Alumno[] = []
    const first = await listAlumnos({ page: 0, size: pageSize, sort: currentSort })
    all = all.concat(first.content ?? [])
    if (isLastPage(first, 0, pageSize)) return all

    const total = typeof first.totalPages === 'number' ? first.totalPages : MAX_PAGES
    for (let p = 1; p < total; p++) {
      const res = await listAlumnos({ page: p, size: pageSize, sort: currentSort })
      all = all.concat(res.content ?? [])
      if (isLastPage(res, p, first.size ?? pageSize)) break
    }
    return all
  }

  // --- ejecuta búsqueda global en cliente ---
  const runGlobalSearch = async (term: string) => {
    const t = normalize(term)
    if (!t) {
      setGlobalMode(false)
      setGlobalLoading(false)
      setGlobalResults([])
      setGlobalError(null)
      setGlobalTerm('')
      setPage(0)
      return
    }

    setGlobalMode(true)
    setGlobalLoading(true)
    setGlobalError(null)
    setGlobalTerm(t)

    try {
      const all = await fetchAllAlumnos(sort)
      const filtered = all.filter((a) => {
        const haystack = normalize(`${a?.nombre ?? ''} ${a?.apellido ?? ''} ${a?.carnet ?? ''}`)
        return haystack.includes(t)
      })
      setGlobalResults(filtered)
    } catch (err) {
      setGlobalError(getErrorMessage(err, 'No fue posible ejecutar la búsqueda global.'))
    } finally {
      setGlobalLoading(false)
    }
  }

  const alumnosVisibles = globalMode ? globalResults : alumnosData

  // cargar vínculos para lo visible
  useEffect(() => {
    if ((globalMode && globalLoading) || (!globalMode && (isLoading || error))) return
    if (!alumnosVisibles.length) {
      setVinculosMapa({})
      setIsLoadingVinculos(false)
      setVinculosFetchError(null)
      return
    }

    let ignore = false
    const fetchVinculos = async () => {
      setIsLoadingVinculos(true)
      setVinculosFetchError(null)
      try {
        const results = await Promise.all(
          alumnosVisibles.map(async (alumno) => {
            try {
              const registros = await listEncargadosPorAlumno(alumno.id)
              return { alumnoId: alumno.id, count: registros.length }
            } catch (err) {
              if (!ignore) {
                setVinculosFetchError((prev) => prev ?? getErrorMessage(err, 'No fue posible cargar los vínculos de algunos alumnos.'))
              }
              return { alumnoId: alumno.id, count: 0 }
            }
          })
        )
        if (!ignore) {
          const mapa: Record<string, number> = {}
          for (const { alumnoId, count } of results) mapa[alumnoId] = count
          setVinculosMapa(mapa)
        }
      } catch (err) {
        if (!ignore) setVinculosFetchError(getErrorMessage(err, 'No fue posible cargar los vínculos.'))
      } finally {
        if (!ignore) setIsLoadingVinculos(false)
      }
    }

    void fetchVinculos()
    return () => { ignore = true }
  }, [alumnosVisibles, globalMode, globalLoading, isLoading, error])

  // decide si esta fila realmente necesita el modal "Ver"
  const needsDetails = (a: Alumno) => {
    const estName = getEstName(a.institutoId) || ''
    const longEst = estName.length > 28
    const longDir = (a.direccion?.trim().length ?? 0) > 35
    const hasExtra = Boolean(a.direccion?.trim() || a.fechaNacimiento)
    return longEst || longDir || hasExtra
  }

  // columnas con look nuevo (incluye Establecimiento + Teléfono) y más espacio a Carnet
  const columns = useMemo<TableColumn<Alumno>[]>(() => [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (a) => (
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(0,102,204,0.12)] text-[#0066cc] text-xs font-bold">
            {`${a?.nombre ?? ''} ${a?.apellido ?? ''}`.trim().slice(0, 2).toUpperCase()}
          </div>
          <span className="truncate font-semibold text-[#2e2e2e]">{a.nombre}</span>
        </div>
      ),
    },
    {
      key: 'apellido',
      header: 'Apellido',
      render: (a) => <span className="text-[#2e2e2e]">{a.apellido}</span>,
    },
    {
      key: 'institutoId',
      header: 'Establecimiento',
      render: (a) => (
        <span className="block max-w-[28ch] truncate text-[#2e2e2e]" title={getEstName(a.institutoId)}>
          {getEstName(a.institutoId)}
        </span>
      ),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (a) => <span className="text-[#2e2e2e]">{a.telefono ?? '-'}</span>,
      cellClassName: 'w-0',
    },
    {
      key: 'carnet',
      header: 'Carnet',
      render: (a) => (
        <span className="text-[#2e2e2e] tabular-nums tracking-wide">{a.carnet ?? '-'}</span>
      ),
      cellClassName: 'min-w-[14ch] pr-3',
    },
    { key: 'estado', header: 'Estado', render: (a) => <BadgeEstado value={a.estado} />, cellClassName: 'w-0' },
    {
      key: 'id',
      header: 'Encargados',
      render: (alumno) => {
        if (isLoadingVinculos) return <span className="text-xs text-gray-500">Cargando...</span>
        const count = vinculosMapa[alumno.id] ?? 0
        return count > 0 ? (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-[#e7fbf3] text-[#0a8c60] ring-[rgba(0,168,107,0.55)]">
            {count === 1 ? '1 vínculo' : `${count} vínculos`}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-[#f3f4f6] text-[#6b7280] ring-[#e5e7eb]">
            Sin encargado
          </span>
        )
      },
      cellClassName: 'w-0',
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [vinculosMapa, isLoadingVinculos, establecimientosMap])

  // acciones por fila
  const renderRowActions = (alumno: Alumno) => (
    <div className="flex justify-end gap-2">
      {needsDetails(alumno) && (
        <Button variant="secondary" size="sm" onClick={() => setSelectedAlumno(alumno)}>
          <Eye className="h-4 w-4" />
          Ver
        </Button>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(`/alumnos/vinculos?alumnoId=${alumno.id}`)}
      >
        <Users className="h-4 w-4" />
        Encargados
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(`/alumnos/${alumno.id}/editar`)}
      >
        <Pencil className="h-4 w-4" />
        Editar
      </Button>
      {role === 'admin' && (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDelete(alumno)}
          isLoading={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      )}
    </div>
  )

  // handlers Buscar / Limpiar
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void runGlobalSearch(searchInput)
  }
  const handleClearSearch = () => {
    setSearchInput('')
    void runGlobalSearch('')
  }

  const handleDelete = async (alumno: Alumno) => {
    if (role !== 'admin') {
      notify({
        title: 'Acción no permitida',
        description: 'Solo el rol administrador puede eliminar registros.',
        variant: 'warning',
      })
      return
    }
    const confirmed = window.confirm(
      `¿Deseas eliminar a ${alumno.nombre} ${alumno.apellido}? Esta acción no se puede deshacer.`
    )
    if (!confirmed) return
    await deleteAlumno(alumno.id)
  }

  const renderAlumnoDetails = (alumno: Alumno) => (
    <dl className="space-y-2 text-sm text-gray-700">
      <div className="flex justify-between gap-4"><dt className="font-semibold">Carnet</dt><dd>{alumno.carnet ?? '-'}</dd></div>
      <div className="flex justify-between gap-4"><dt className="font-semibold">Teléfono</dt><dd>{alumno.telefono ?? '-'}</dd></div>
      <div className="flex justify-between gap-4"><dt className="font-semibold">Dirección</dt><dd>{alumno.direccion ?? '-'}</dd></div>
      <div className="flex justify-between gap-4"><dt className="font-semibold">Fecha de nacimiento</dt><dd>{alumno.fechaNacimiento ?? '-'}</dd></div>
      <div className="flex justify-between gap-4"><dt className="font-semibold">Establecimiento</dt><dd>{getEstName(alumno.institutoId)}</dd></div>
      <div className="flex justify-between gap-4"><dt className="font-semibold">Estado</dt><dd>{alumno.estado}</dd></div>
      <div className="flex justify-between gap-4">
        <dt className="font-semibold">Encargados vinculados</dt>
        <dd>
          {isLoadingVinculos
            ? 'Cargando...'
            : (vinculosMapa[alumno.id] ?? 0) === 0
              ? 'Sin encargados'
              : `${vinculosMapa[alumno.id]} ${vinculosMapa[alumno.id] === 1 ? 'encargado' : 'encargados'}`}
        </dd>
      </div>
    </dl>
  )

  // Etiquetas del hero
  const filtrosLabel = globalMode
    ? (globalTerm ? `Búsqueda: “${globalTerm}”` : 'Búsqueda global')
    : 'Sin filtros'

  const filtrosAccent: 'white'|'yellow'|'orange' = globalMode ? 'orange' : 'white'
  const totalRegistros = alumnosVisibles.length

  return (
    <Page
      title="Alumnos"
      description="Gestión de alumnos registrados."
      actions={
        <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
          <Button
            variant="secondary"
            onClick={() => (globalMode ? runGlobalSearch(globalTerm) : refetch())}
            disabled={globalMode ? globalLoading : isFetching}
            title="Recargar datos"
          >
            <RotateCw className={`mr-2 h-4 w-4 ${(globalMode ? globalLoading : isFetching) ? 'animate-spin' : ''}`} />
            {globalMode ? (globalLoading ? 'Actualizando…' : 'Recargar búsqueda') : (isFetching ? 'Actualizando…' : 'Recargar')}
          </Button>
          <Button onClick={() => navigate('/alumnos/nuevo')} title="Crear nuevo alumno">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo alumno
          </Button>
        </div>
      }
    >
      {/* Resumen superior con gradiente + ORDENAR aquí para no duplicar */}
      <HeroSummary
        title="Resumen de alumnos"
        total={totalRegistros}
        filtersLabel={filtrosLabel}
        filtersAccent={filtrosAccent}
        sort={sort}
        options={SORT_OPTIONS}
        onChangeSort={(v) => {
          setSort(v)
          if (globalMode) void runGlobalSearch(searchInput || globalTerm)
          else setPage(0)
        }}
      />

      {/* Filtros / búsqueda (sin ordenar para evitar duplicado) */}
      <div className="sticky top-14 z-10">
        <PanelCard className="px-5 py-5">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-12">
              <label className="block text-sm font-semibold text-[#2e2e2e]">Búsqueda global</label>
              <input
                className="mt-2 w-full rounded-xl border border-[#cfe0f7] bg-[rgba(229,242,255,0.55)] px-3 py-2 text-sm text-[#1f3c63] shadow-[0_12px_32px_-26px_rgba(0,102,204,0.65)] transition-all focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.35)]"
                placeholder="Nombre, apellido o carnet…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <p className="mt-1 text-xs text-[#667085]">Busca en todas las páginas del servidor (modo cliente).</p>
            </div>

            <div className="md:col-span-12 flex flex-wrap gap-2 pt-1">
              <Button type="submit" variant="primary" disabled={globalLoading}>
                <Search className="mr-2 h-4 w-4" />
                {globalLoading ? 'Buscando…' : 'Buscar'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClearSearch} disabled={globalLoading}>
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </form>
        </PanelCard>
      </div>

      {/* Mensajes */}
      {vinculosFetchError && (
        <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          {vinculosFetchError}
        </div>
      )}
      {globalError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}
      {establecimientosError && (
        <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          {getErrorMessage(establecimientosError, 'No fue posible cargar los establecimientos para mostrar los nombres.')}
        </div>
      )}

      {/* Tabla */}
      <div className={`${cls.panelCard} mt-4 p-0`}>
        {globalMode ? (
          globalLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <Table
              data={alumnosVisibles}
              columns={columns}
              emptyMessage="No hay resultados para tu búsqueda."
              classNameHeader={cls.tableHeader}
              classNameRow={cls.tableRow}
              renderActions={renderRowActions}
            />
          )
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(error, 'No fue posible cargar los alumnos.')}
            <div className="mt-2">
              <Button size="sm" variant="secondary" onClick={() => refetch()}>
                <RotateCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </div>
        ) : isLoading || isLoadingEst ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <Table
            data={alumnosVisibles}
            columns={columns}
            emptyMessage="No hay alumnos registrados."
            classNameHeader={cls.tableHeader}
            classNameRow={cls.tableRow}
            renderActions={renderRowActions}
          />
        )}
      </div>

      {/* Pie de página simple (paginación server en modo normal) */}
      {globalMode ? (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Mostrando {alumnosVisibles.length} resultado(s) (búsqueda global)</span>
          <div />
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0 || isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((prev) => (totalPages === 0 ? prev : Math.min(prev + 1, totalPages - 1)))}
              disabled={totalPages === 0 || page >= totalPages - 1 || isLoading}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      <Modal
        isOpen={selectedAlumno !== null}
        onClose={() => setSelectedAlumno(null)}
        title={selectedAlumno ? `${selectedAlumno.nombre} ${selectedAlumno.apellido}` : 'Alumno'}
      >
        {selectedAlumno && renderAlumnoDetails(selectedAlumno)}
      </Modal>
    </Page>
  )
}

export default AlumnosList