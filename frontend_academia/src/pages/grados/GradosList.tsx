import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  RotateCw,
  Search,
  X,
  ArrowLeft,
  ArrowRight,
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

import type { Grado, Nivel } from '../../contract/moduleA'
import type { Page as PageResult } from '../../contract/pagination'
import { listGrados, removeGrado } from '../../services/grados'
import { listNiveles } from '../../services/niveles'

// 🎨 Style kit
import HeroSummary from '@/components/kit/HeroSummary'
import PanelCard from '@/components/kit/PanelCard'
import { cls } from '@/components/ui/stylekit'

const pageSize = 10

const SORT_OPTIONS = [
  { label: 'Nombre (A-Z)', value: 'nombre,asc' },
  { label: 'Nombre (Z-A)', value: 'nombre,desc' },
]

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

// Normaliza: minúsculas + sin acentos + trim
const normalize = (s: unknown) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()

// Detecta última página según varias estrategias
const isLastPage = (res: any, pageIndex: number, sizeFallback = pageSize) => {
  if (typeof res?.last === 'boolean') return res.last
  if (typeof res?.totalPages === 'number') return pageIndex >= res.totalPages - 1
  const sz = typeof res?.size === 'number' ? res.size : sizeFallback
  const len = Array.isArray(res?.content) ? res.content.length : 0
  return len < sz
}

// columnas con look mejorado
const createColumns = (nivelById: Map<string, string>): TableColumn<Grado>[] => [
  {
    key: 'nombre',
    header: 'Nombre',
    render: (g) => (
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(0,102,204,0.12)] text-[#0066cc] text-xs font-bold">
          {g.nombre.slice(0, 2).toUpperCase()}
        </div>
        <span className="truncate font-semibold text-[#2e2e2e]">{g.nombre}</span>
      </div>
    ),
  },
  {
    key: 'nivelId',
    header: 'Nivel',
    render: (g) => {
      const nivel = nivelById.get(g.nivelId) ?? '-'
      return nivel === '-' ? (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-[#f3f4f6] text-[#6b7280] ring-[#e5e7eb]">
          —
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-[#e7fbf3] text-[#0a8c60] ring-[rgba(0,168,107,0.55)]">
          {nivel}
        </span>
      )
    },
    cellClassName: 'w-0',
  },
]

const GradosList = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const role = useAuthStore((state) => state.role)

  // --- estado normal paginado ---
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0].value)

  // --- búsqueda global (modo cliente) ---
  const [searchInput, setSearchInput] = useState('')
  const [globalMode, setGlobalMode] = useState(false)
  const [globalLoading, setGlobalLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [globalResults, setGlobalResults] = useState<Grado[]>([])
  const [globalTerm, setGlobalTerm] = useState('')

  // --- data base ---
  const {
    data: gradosPage,
    isLoading: isLoadingGrados,
    isFetching,
    error: gradosError,
    refetch,
  } = useApiQuery<PageResult<Grado>>({
    queryKey: ['grados', page, sort],
    queryFn: () => listGrados({ page, size: pageSize, sort }),
    enabled: !globalMode, // deshabilita el fetch paginado cuando estás en búsqueda global
  })

  const {
    data: niveles,
    isLoading: isLoadingNiveles,
    error: nivelesError,
  } = useApiQuery<Nivel[]>({
    queryKey: ['niveles', 'for-grados'],
    queryFn: () => listNiveles(),
  })

  const { mutateAsync: deleteGrado, isPending: isDeleting } = useApiMutation({
    mutationFn: (gradoId: string) => removeGrado(gradoId),
    onSuccess: () => {
      notify({
        title: 'Grado eliminado',
        description: 'Se eliminó correctamente.',
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
        description: getErrorMessage(err, 'No fue posible eliminar el grado.'),
        variant: 'error',
      })
    },
  })

  // --- map de niveles ---
  const nivelById = useMemo(() => {
    const map = new Map<string, string>()
    ;(niveles ?? []).forEach((nivel) => map.set(nivel.nivelId, nivel.nombre))
    return map
  }, [niveles])

  // --- columnas ---
  const tableColumns = useMemo(() => createColumns(nivelById), [nivelById])

  // --- helpers de datos visibles ---
  const gradosData = gradosPage?.content ?? []
  const totalPages = gradosPage?.totalPages ?? 0
  const gradosVisibles = globalMode ? globalResults : gradosData

  // --- carga robusta de todas las páginas para búsqueda global ---
  const fetchAllGrados = async (currentSort: string) => {
    const MAX_PAGES = 500
    let all: Grado[] = []
    const first = await listGrados({ page: 0, size: pageSize, sort: currentSort })
    all = all.concat(first.content)
    if (isLastPage(first, 0, pageSize)) return all

    const total = first.totalPages
    for (let p = 1; p < Math.min(total, MAX_PAGES); p++) {
      const res = await listGrados({ page: p, size: pageSize, sort: currentSort })
      all = all.concat(res.content)
      if (isLastPage(res, p, first.size)) break
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
      const all = await fetchAllGrados(sort)
      const filtered = all.filter((grado) => {
        const nombre = normalize(grado?.nombre)
        const nivelNombre = normalize(nivelById.get(grado.nivelId) ?? '')
        return `${nombre} ${nivelNombre}`.includes(t)
      })
      setGlobalResults(filtered)
    } catch (err) {
      setGlobalError(getErrorMessage(err, 'No fue posible ejecutar la búsqueda global.'))
    } finally {
      setGlobalLoading(false)
    }
  }

  // --- handlers de UI ---
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void runGlobalSearch(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    void runGlobalSearch('') // sale del modo global
  }

  const handleDelete = async (grado: Grado) => {
    if (role !== 'admin') {
      notify({
        title: 'Acción no permitida',
        description: 'Solo administradores pueden eliminar registros.',
        variant: 'warning',
      })
      return
    }
    const confirmed = window.confirm(`¿Deseas eliminar el grado ${grado.nombre}?`)
    if (!confirmed) return
    await deleteGrado(grado.gradoId)
  }

  // --- mensajes/etiquetas ---
  const combinedError = gradosError ?? nivelesError
  const filtrosLabel = globalMode
    ? (globalTerm ? `Búsqueda: “${globalTerm}”` : 'Búsqueda global')
    : 'Sin filtros'
  const filtrosAccent: 'white' | 'yellow' | 'orange' = globalMode ? 'orange' : 'white'
  const totalRegistros = gradosVisibles.length

  return (
    <Page
      title="Grados"
      description="Gestión de grados académicos."
      actions={
        <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
          <Button
            variant="secondary"
            onClick={() => (globalMode ? runGlobalSearch(globalTerm) : refetch())}
            disabled={globalMode ? globalLoading : isFetching}
          >
            <RotateCw className={`mr-2 h-4 w-4 ${(globalMode ? globalLoading : isFetching) ? 'animate-spin' : ''}`} />
            {globalMode ? (globalLoading ? 'Actualizando…' : 'Recargar búsqueda') : (isFetching ? 'Actualizando…' : 'Recargar')}
          </Button>
          <Button onClick={() => navigate('/grados/nuevo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo grado
          </Button>
        </div>
      }
    >
      {/* Resumen con gradiente + Ordenar aquí (evitamos duplicados) */}
      <HeroSummary
        title="Resumen de grados"
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

      {/* Búsqueda (sticky) */}
      <div className="sticky top-14 z-10">
        <PanelCard className="px-5 py-5">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-12">
              <label className="block text-sm font-semibold text-[#2e2e2e]">Búsqueda global</label>
              <input
                className="mt-2 w-full rounded-xl border border-[#cfe0f7] bg-[rgba(229,242,255,0.55)] px-3 py-2 text-sm text-[#1f3c63] shadow-[0_12px_32px_-26px_rgba(0,102,204,0.65)] transition-all focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.35)]"
                placeholder="Nombre de grado o nombre de nivel…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                disabled={isLoadingGrados || isLoadingNiveles}
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
      {globalError && (
        <div className={`${cls.panelCard} mt-4 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {globalError}
        </div>
      )}
      {combinedError && !globalMode && (
        <div className={`${cls.panelCard} mt-4 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {getErrorMessage(combinedError, 'No fue posible cargar los grados.')}
          <div className="mt-2">
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              <RotateCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className={`${cls.panelCard} mt-4 p-0`}>
        {globalMode ? (
          globalLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <Table
              data={gradosVisibles}
              columns={tableColumns}
              emptyMessage="No hay resultados para tu búsqueda."
              classNameHeader={cls.tableHeader}
              classNameRow={cls.tableRow}
              renderActions={(grado) => (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/grados/${grado.gradoId}/editar`)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  {role === 'admin' && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(grado)} isLoading={isDeleting}>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  )}
                </div>
              )}
            />
          )
        ) : isLoadingGrados || isLoadingNiveles ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <Table
            data={gradosVisibles}
            columns={tableColumns}
            emptyMessage="No hay grados registrados."
            classNameHeader={cls.tableHeader}
            classNameRow={cls.tableRow}
            renderActions={(grado) => (
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/grados/${grado.gradoId}/editar`)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                {role === 'admin' && (
                  <Button variant="danger" size="sm" onClick={() => handleDelete(grado)} isLoading={isDeleting}>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Pie de página */}
      {globalMode ? (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Mostrando {gradosVisibles.length} resultado(s) (búsqueda global)</span>
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
              disabled={page === 0 || isLoadingGrados}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((prev) => (totalPages === 0 ? prev : Math.min(prev + 1, totalPages - 1)))}
              disabled={totalPages === 0 || page >= totalPages - 1 || isLoadingGrados}
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

export default GradosList