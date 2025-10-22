// src/pages/establecimientos/EstList.tsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { isApiError } from '../../api/types'
import { useToast } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'
import { useApiMutation, useApiQuery } from '../../hooks'
import type { Establecimiento } from '../../contract/moduleA'
import type { Page as PageResult } from '../../contract/pagination'
import { listEstablecimientos, removeEstablecimiento } from '../../services/establecimientos'

// 🎨 Style kit
import HeroSummary from '@/components/kit/HeroSummary'
import PanelCard from '@/components/kit/PanelCard'
import { cls } from '@/components/ui/stylekit'

const pageSize = 10
const ADDRESS_INLINE_MAX = 60

const SORT_OPTIONS = [
  { label: 'Nombre (A-Z)', value: 'nombre,asc' },
  { label: 'Nombre (Z-A)', value: 'nombre,desc' },
  { label: 'Jornada (A-Z)', value: 'jornada,asc' },
  { label: 'Jornada (Z-A)', value: 'jornada,desc' },
]

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const normalize = (s: unknown) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()

const isLastPage = (res: any, pageIndex: number, sizeFallback = pageSize) => {
  if (typeof res?.last === 'boolean') return res.last
  if (typeof res?.totalPages === 'number') return pageIndex >= res.totalPages - 1
  const sz = typeof res?.size === 'number' ? res.size : sizeFallback
  const len = Array.isArray(res?.content) ? res.content.length : 0
  return len < sz
}

const EstList = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const role = useAuthStore((state) => state.role)

  // Paginado normal
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0]?.value ?? 'nombre,asc')

  // Búsqueda global en cliente
  const [searchInput, setSearchInput] = useState('')
  const [globalMode, setGlobalMode] = useState(false)
  const [globalLoading, setGlobalLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [globalResults, setGlobalResults] = useState<Establecimiento[]>([])
  const [globalTerm, setGlobalTerm] = useState('')

  // Modal (solo para dirección larga)
  const [selectedItem, setSelectedItem] = useState<Establecimiento | null>(null)

  const { data, isLoading, isFetching, error, refetch } = useApiQuery<PageResult<Establecimiento>>({
    queryKey: ['establecimientos', page, sort],
    queryFn: () => listEstablecimientos({ page, size: pageSize, sort }),
    enabled: !globalMode,
  })

  const { mutateAsync: deleteEstablecimiento, isPending: isDeleting } = useApiMutation({
    mutationFn: (institutoId: string) => removeEstablecimiento(institutoId),
    onSuccess: () => {
      notify({
        title: 'Establecimiento eliminado',
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
        description: getErrorMessage(err, 'No fue posible eliminar el establecimiento.'),
        variant: 'error',
      })
    },
  })

  const totalPages = data?.totalPages ?? 0
  const establecimientosData = data?.content ?? []

  // Carga robusta de todas las páginas
  const fetchAllEstablecimientos = async (currentSort: string) => {
    const MAX_PAGES = 500
    let all: Establecimiento[] = []
    const first = await listEstablecimientos({ page: 0, size: pageSize, sort: currentSort })
    all = all.concat(first.content ?? [])
    if (isLastPage(first, 0, pageSize)) return all

    const total = typeof first.totalPages === 'number' ? first.totalPages : MAX_PAGES
    for (let p = 1; p < total; p++) {
      const res = await listEstablecimientos({ page: p, size: pageSize, sort: currentSort })
      all = all.concat(res.content ?? [])
      if (isLastPage(res, p, first.size ?? pageSize)) break
    }
    return all
  }

  // Ejecuta búsqueda global
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
      const all = await fetchAllEstablecimientos(sort)
      const filtered = all.filter((e) => {
        const haystack = normalize(
          `${e?.nombre ?? ''} ${e?.nombreDirector ?? ''} ${e?.telefono ?? ''} ${e?.jornada ?? ''}`,
        )
        return haystack.includes(t)
      })
      setGlobalResults(filtered)
    } catch (err) {
      setGlobalError(getErrorMessage(err, 'No fue posible ejecutar la búsqueda global.'))
    } finally {
      setGlobalLoading(false)
    }
  }

  const establecimientosVisibles = globalMode ? globalResults : establecimientosData

  const isLongAddress = (direccion?: string | null) => (direccion?.trim().length ?? 0) > ADDRESS_INLINE_MAX

  // columnas con look mejorado (incluye Dirección inline si es corta)
  const columns = useMemo<TableColumn<Establecimiento>[]>(() => [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (e) => (
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(0,102,204,0.12)] text-[#0066cc] text-xs font-bold">
            {String(e?.nombre ?? '').slice(0, 2).toUpperCase()}
          </div>
          <span className="truncate font-semibold text-[#2e2e2e]">{e.nombre}</span>
        </div>
      ),
    },
    {
      key: 'jornada',
      header: 'Jornada',
      render: (e) => (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-[#e7fbf3] text-[#0a8c60] ring-[rgba(0,168,107,0.55)]">
          {e.jornada}
        </span>
      ),
      cellClassName: 'w-0',
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (e) => <span className="text-[#2e2e2e]">{e.telefono ?? '-'}</span>,
      cellClassName: 'w-0',
    },
    {
      key: 'direccion',
      header: 'Dirección',
      render: (e) => {
        const dir = e.direccion?.trim()
        if (!dir) return <span className="text-[#6b7280]">-</span>
        if (isLongAddress(dir)) {
          return <span className="text-[#6b7280]">—</span>
        }
        return <span className="block max-w-[28ch] truncate text-[#2e2e2e]">{dir}</span>
      },
    },
    {
      key: 'nombreDirector',
      header: 'Director',
      render: (e) => <span className="text-[#2e2e2e]">{e.nombreDirector ?? '-'}</span>,
    },
  ], [])

  // Handlers
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void runGlobalSearch(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    void runGlobalSearch('') // salir de modo global
  }

  const handleDelete = async (establecimiento: Establecimiento) => {
    if (role !== 'admin') {
      notify({
        title: 'Acción no permitida',
        description: 'Solo administradores pueden eliminar registros.',
        variant: 'warning',
      })
      return
    }

    const confirmed = window.confirm(
      `¿Deseas eliminar ${establecimiento.nombre}? Esta acción no se puede deshacer.`,
    )
    if (!confirmed) return

    await deleteEstablecimiento(establecimiento.institutoId)
  }

  // solo mostramos dirección en el modal
  const renderDireccionOnly = (establecimiento: Establecimiento) => {
    const dir = establecimiento.direccion?.trim()
    return (
      <div className="text-sm text-gray-700">
        {dir ? (
          <p className="whitespace-pre-wrap leading-relaxed">{dir}</p>
        ) : (
          <p className="text-gray-500">Sin dirección registrada.</p>
        )}
      </div>
    )
  }

  // Etiquetas del hero
  const filtrosLabel = globalMode ? (globalTerm ? `Búsqueda: “${globalTerm}”` : 'Búsqueda global') : 'Sin filtros'
  const filtrosAccent: 'white' | 'yellow' | 'orange' = globalMode ? 'orange' : 'white'
  const totalRegistros = establecimientosVisibles.length

  return (
    <Page
      title="Establecimientos"
      description="Gestión de sedes y establecimientos."
      actions={
        <div className="flex items-center gap-2 rounded-full bg:[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
          <Button
            variant="secondary"
            onClick={() => (globalMode ? runGlobalSearch(globalTerm) : refetch())}
            disabled={globalMode ? globalLoading : isFetching}
            title="Recargar datos"
          >
            {/* icono recargar */}
            <svg className={`mr-2 h-4 w-4 ${(globalMode ? globalLoading : isFetching) ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 11a8 8 0 10-1.582 4.418M20 20v-5" />
            </svg>
            {globalMode ? (globalLoading ? 'Actualizando…' : 'Recargar búsqueda') : (isFetching ? 'Actualizando…' : 'Recargar')}
          </Button>
          <Button onClick={() => navigate('/establecimientos/nuevo')}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M12 6v12M6 12h12"/></svg>
            Nuevo establecimiento
          </Button>
        </div>
      }
    >
      {/* Resumen con gradiente (mantiene ORDENAR aquí) */}
      <HeroSummary
        title="Resumen de establecimientos"
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

      {/* Filtros (sticky) - solo BÚSQUEDA para evitar duplicado de ordenar */}
      <div className="sticky top-14 z-10">
        <PanelCard className="px-5 py-5">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-12">
              <label className="block text-sm font-semibold text-[#2e2e2e]">Búsqueda global</label>
              <input
                className="mt-2 w-full rounded-xl border border-[#cfe0f7] bg-[rgba(229,242,255,0.55)] px-3 py-2 text-sm text-[#1f3c63] shadow-[0_12px_32px_-26px_rgba(0,102,204,0.65)] transition-all focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.35)]"
                placeholder="Nombre, director, teléfono o jornada…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <p className="mt-1 text-xs text-[#667085]">Busca en todas las páginas del servidor (modo cliente).</p>
            </div>

            <div className="md:col-span-12 flex flex-wrap gap-2 pt-1">
              <Button type="submit" variant="primary" disabled={globalLoading}>
                {globalLoading ? 'Buscando…' : 'Buscar'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClearSearch} disabled={globalLoading}>
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

      {error && !globalMode && (
        <div className={`${cls.panelCard} mt-4 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {getErrorMessage(error, 'No fue posible cargar los establecimientos.')}
          <div className="mt-2">
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Tabla */}
      {globalMode ? (
        globalLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className={`${cls.panelCard} mt-4 p-0`}>
            <Table
              data={establecimientosVisibles}
              columns={columns}
              emptyMessage="No hay resultados para tu búsqueda."
              classNameHeader={cls.tableHeader}
              classNameRow={cls.tableRow}
              renderActions={(establecimiento) => {
                const dir = establecimiento.direccion?.trim()
                const showViewDireccion = !!dir && isLongAddress(dir)
                return (
                  <div className="flex justify-end gap-2">
                    {showViewDireccion && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedItem(establecimiento)}
                      >
                        Ver dirección
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/establecimientos/${establecimiento.institutoId}/editar`)}
                    >
                      Editar
                    </Button>
                    {role === 'admin' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(establecimiento)}
                        isLoading={isDeleting}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                )
              }}
            />
          </div>
        )
      ) : isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className={`${cls.panelCard} mt-4 p-0`}>
          <Table
            data={establecimientosVisibles}
            columns={columns}
            emptyMessage="No hay establecimientos registrados."
            classNameHeader={cls.tableHeader}
            classNameRow={cls.tableRow}
            renderActions={(establecimiento) => {
              const dir = establecimiento.direccion?.trim()
              const showViewDireccion = !!dir && isLongAddress(dir)
              return (
                <div className="flex justify-end gap-2">
                  {showViewDireccion && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedItem(establecimiento)}
                    >
                      Ver dirección
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/establecimientos/${establecimiento.institutoId}/editar`)}
                  >
                    Editar
                  </Button>
                  {role === 'admin' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(establecimiento)}
                      isLoading={isDeleting}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </div>
      )}

      {/* Pie de página */}
      {globalMode ? (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Mostrando {establecimientosVisibles.length} resultado(s) (búsqueda global)</span>
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
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal: solo dirección */}
      <Modal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title={selectedItem ? `Dirección de ${selectedItem.nombre}` : 'Dirección'}
      >
        {selectedItem && renderDireccionOnly(selectedItem)}
      </Modal>
    </Page>
  )
}

export default EstList
