// src/pages/encargados/EncargadosList.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  RotateCw,
  Search,
  X,
  ArrowLeft,
  ArrowRight,
  Users,
  Pencil,
  Trash2,
} from 'lucide-react'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { isApiError } from '../../api/types'
import { useToast } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'
import { useApiMutation, useApiQuery } from '../../hooks'

import type { Encargado } from '../../contract/moduleA'
import type { Page as PageResult } from '../../contract/pagination'
import { listEncargados, removeEncargado } from '../../services/encargados'
import { listAlumnosPorEncargado } from '../../services/alumnoEncargado'

// 🎨 Style kit
import HeroSummary from '@/components/kit/HeroSummary'
import PanelCard from '@/components/kit/PanelCard'
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

const EncargadosList = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const role = useAuthStore((state) => state.role)

  // --- paginado normal ---
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState(SORT_OPTIONS[0]?.value ?? 'nombre,asc')

  // --- búsqueda global en cliente ---
  const [searchInput, setSearchInput] = useState('')
  const [globalMode, setGlobalMode] = useState(false)
  const [globalLoading, setGlobalLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [globalResults, setGlobalResults] = useState<Encargado[]>([])
  const [globalTerm, setGlobalTerm] = useState('')

  // --- chip alumnos vinculados ---
  const [alumnosPorEncargado, setAlumnosPorEncargado] = useState<Record<string, number>>({})
  const [isLoadingAlumnosVinculados, setIsLoadingAlumnosVinculados] = useState(false)
  const [alumnosVinculadosError, setAlumnosVinculadosError] = useState<string | null>(null)

  // Paginado normal (deshabilitado en modo global)
  const { data, isLoading, isFetching, error, refetch } = useApiQuery<PageResult<Encargado>>({
    queryKey: ['encargados', page, sort],
    queryFn: () => listEncargados({ page, size: pageSize, sort }),
    enabled: !globalMode,
  })

  const { mutateAsync: deleteEncargado, isPending: isDeleting } = useApiMutation({
    mutationFn: (id: string) => removeEncargado(id),
    onSuccess: () => {
      notify({
        title: 'Encargado eliminado',
        description: 'Se eliminó el encargado seleccionado.',
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
        description: getErrorMessage(err, 'No fue posible eliminar el registro.'),
        variant: 'error',
      })
    },
  })

  const totalPages = data?.totalPages ?? 0
  const encargadosData = data?.content ?? []

  // --- función robusta: carga todas las páginas ---
  const fetchAllEncargados = async (currentSort: string) => {
    const MAX_PAGES = 500
    let all: Encargado[] = []
    const first = await listEncargados({ page: 0, size: pageSize, sort: currentSort })
    all = all.concat(first.content ?? [])
    if (isLastPage(first, 0, pageSize)) return all

    const total = typeof first.totalPages === 'number' ? first.totalPages : MAX_PAGES
    for (let p = 1; p < total; p++) {
      const res = await listEncargados({ page: p, size: pageSize, sort: currentSort })
      all = all.concat(res.content ?? [])
      if (isLastPage(res, p, first.size ?? pageSize)) break
    }
    return all
  }

  // --- ejecuta búsqueda global cliente ---
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
      const all = await fetchAllEncargados(sort)
      const filtered = all.filter((e) => {
        const hay = normalize(`${e?.nombre ?? ''} ${e?.apellido ?? ''} ${e?.telefono ?? ''}`)
        return hay.includes(t)
      })
      setGlobalResults(filtered)
    } catch (err) {
      setGlobalError(getErrorMessage(err, 'No fue posible ejecutar la búsqueda global.'))
    } finally {
      setGlobalLoading(false)
    }
  }

  // dataset visible
  const encargadosVisibles = globalMode ? globalResults : encargadosData

  // cargar alumnos vinculados para lo visible
  useEffect(() => {
    if ((globalMode && globalLoading) || (!globalMode && (isLoading || error))) return

    if (!encargadosVisibles.length) {
      setAlumnosPorEncargado({})
      setIsLoadingAlumnosVinculados(false)
      setAlumnosVinculadosError(null)
      return
    }

    let ignore = false
    const fetchAlumnos = async () => {
      setIsLoadingAlumnosVinculados(true)
      setAlumnosVinculadosError(null)
      try {
        const results = await Promise.all(
          encargadosVisibles.map(async (encargado) => {
            try {
              const registros = await listAlumnosPorEncargado(encargado.id)
              return { encargadoId: encargado.id, count: registros.length }
            } catch (err) {
              if (!ignore) {
                setAlumnosVinculadosError((prev) => prev ?? getErrorMessage(err, 'No fue posible cargar los alumnos vinculados.'))
              }
              return { encargadoId: encargado.id, count: 0 }
            }
          }),
        )
        if (!ignore) {
          const mapa: Record<string, number> = {}
          for (const { encargadoId, count } of results) mapa[encargadoId] = count
          setAlumnosPorEncargado(mapa)
        }
      } catch (err) {
        if (!ignore) setAlumnosVinculadosError(getErrorMessage(err, 'No fue posible cargar los alumnos vinculados.'))
      } finally {
        if (!ignore) setIsLoadingAlumnosVinculados(false)
      }
    }

    void fetchAlumnos()
    return () => { ignore = true }
  }, [encargadosVisibles, globalMode, globalLoading, isLoading, error])

  // columnas con look nuevo
  const columns = useMemo<TableColumn<Encargado>[]>(() => [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (e) => (
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(0,102,204,0.12)] text-[#0066cc] text-xs font-bold">
            {`${e?.nombre ?? ''} ${e?.apellido ?? ''}`.trim().slice(0, 2).toUpperCase()}
          </div>
          <span className="truncate font-semibold text-[#2e2e2e]">{e.nombre}</span>
        </div>
      ),
    },
    { key: 'apellido', header: 'Apellido', render: (e) => <span className="text-[#2e2e2e]">{e.apellido}</span> },
    { key: 'telefono', header: 'Teléfono', render: (e) => <span className="text-[#2e2e2e]">{e.telefono ?? '-'}</span> },
    {
      key: 'id',
      header: 'Alumnos vinculados',
      render: (encargado) => {
        if (isLoadingAlumnosVinculados) {
          return <span className="text-xs text-gray-500">Cargando...</span>
        }
        const count = alumnosPorEncargado[encargado.id] ?? 0
        return count > 0 ? (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-[#e7fbf3] text-[#0a8c60] ring-[rgba(0,168,107,0.55)]">
            {count === 1 ? '1 alumno' : `${count} alumnos`}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-[#f3f4f6] text-[#6b7280] ring-[#e5e7eb]">
            Sin alumnos
          </span>
        )
      },
    },
  ], [alumnosPorEncargado, isLoadingAlumnosVinculados])

  // handlers buscar / limpiar
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void runGlobalSearch(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    void runGlobalSearch('') // sale de modo global
  }

  const handleDelete = async (encargado: Encargado) => {
    if (role !== 'admin') {
      notify({
        title: 'Acción no permitida',
        description: 'Solo administradores pueden eliminar registros.',
        variant: 'warning',
      })
      return
    }
    const confirmed = window.confirm(
      `¿Deseas eliminar a ${encargado.nombre} ${encargado.apellido}? Esta acción no se puede deshacer.`,
    )
    if (!confirmed) return
    await deleteEncargado(encargado.id)
  }

  // etiquetas del hero
  const filtrosLabel = globalMode
    ? (globalTerm ? `Búsqueda: “${globalTerm}”` : 'Búsqueda global')
    : 'Sin filtros'
  const filtrosAccent: 'white'|'yellow'|'orange' = globalMode ? 'orange' : 'white'
  const totalRegistros = encargadosVisibles.length

  return (
    <Page
      title="Encargados"
      description="Gestión de encargados y tutores."
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
          <Button onClick={() => navigate('/encargados/nuevo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo encargado
          </Button>
        </div>
      }
    >
      {/* Resumen superior con gradiente (mantiene ORDENAR aquí) */}
      <HeroSummary
        title="Resumen de encargados"
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

      {/* Búsqueda (sin control de ordenar para evitar duplicado) */}
      <div className="sticky top-14 z-10">
        <PanelCard className="px-5 py-5">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-12">
              <label className="block text-sm font-semibold text-[#2e2e2e]">Búsqueda global</label>
              <input
                className="mt-2 w-full rounded-xl border border-[#cfe0f7] bg-[rgba(229,242,255,0.55)] px-3 py-2 text-sm text-[#1f3c63] shadow-[0_12px_32px_-26px_rgba(0,102,204,0.65)] transition-all focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.35)]"
                placeholder="Nombre, apellido o teléfono…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
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
      {alumnosVinculadosError && (
        <div className={`${cls.panelCard} mt-4 border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700`}>
          {alumnosVinculadosError}
        </div>
      )}
      {globalError && (
        <div className={`${cls.panelCard} mt-4 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {globalError}
        </div>
      )}

      {/* Tabla */}
      <div className={`${cls.panelCard} mt-4 p-0`}>
        {globalMode ? (
          globalLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <Table
              data={encargadosVisibles}
              columns={columns}
              emptyMessage="No hay resultados para tu búsqueda."
              classNameHeader={cls.tableHeader}
              classNameRow={cls.tableRow}
              renderActions={(encargado) => (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/alumnos/vinculos?encargadoId=${encargado.id}`)}
                  >
                    <Users className="h-4 w-4" />
                    Alumnos
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/encargados/${encargado.id}/editar`)}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  {role === 'admin' && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(encargado)} isLoading={isDeleting}>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  )}
                </div>
              )}
            />
          )
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(error, 'No fue posible cargar los encargados.')}
            <div className="mt-2">
              <Button size="sm" variant="secondary" onClick={() => refetch()}>
                <RotateCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <Table
            data={encargadosVisibles}
            columns={columns}
            emptyMessage="No hay encargados registrados."
            classNameHeader={cls.tableHeader}
            classNameRow={cls.tableRow}
            renderActions={(encargado) => (
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/alumnos/vinculos?encargadoId=${encargado.id}`)}
                >
                  <Users className="h-4 w-4" />
                  Alumnos
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/encargados/${encargado.id}/editar`)}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                {role === 'admin' && (
                  <Button variant="danger" size="sm" onClick={() => handleDelete(encargado)} isLoading={isDeleting}>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Pie de página simple (paginación server en modo normal) */}
      {globalMode ? (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Mostrando {encargadosVisibles.length} resultado(s) (búsqueda global)</span>
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
              onClick={() =>
                setPage((prev) => (totalPages === 0 ? prev : Math.min(prev + 1, totalPages - 1)))
              }
              disabled={totalPages === 0 || page >= totalPages - 1 || isLoading}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </Page>
  )
}

export default EncargadosList