import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCw, X, Pencil, Trash2, Search } from 'lucide-react'

import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/auth'
import { useApiMutation, useApiQuery } from '@/hooks'
import type { CursoCatalogo } from '@/contract/moduleB'
import type { Page as PageResult } from '@/contract/pagination'
import { isApiError } from '@/api/types'
import { listCursosCatalogo, removeCursoCatalogo } from '@/services/cursosCatalogo'
import NiceSelect from '@/components/ui/NiceSelect'

const pageSizeOptions = [10, 20, 50]
const defaultPageSize = pageSizeOptions[0]

const columns: TableColumn<CursoCatalogo>[] = [
  { key: 'nombre', header: 'Nombre' },
  { key: 'nivelCurso', header: 'Nivel', render: (curso) => curso.nivelCurso ?? '-' },
  { key: 'duracion', header: 'Duración', render: (curso) => curso.duracion ?? '-' },
]

const SORT_OPTIONS = [
  { label: 'Nombre (A-Z)', value: 'nombre,asc' },
  { label: 'Nombre (Z-A)', value: 'nombre,desc' },
]

const normalizeText = (value?: string | null) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const CursoCatalogoList = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const role = useAuthStore((state) => state.role)

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(defaultPageSize)
  const [sort, setSort] = useState(SORT_OPTIONS[0]?.value ?? 'nombre,asc')
  const [searchInput, setSearchInput] = useState('')
  const [nombreFilter, setNombreFilter] = useState<string | undefined>(undefined)

  const hasFilter = Boolean(nombreFilter)
  const effectivePage = hasFilter ? 0 : page
  const effectiveSize = hasFilter ? Math.max(size, 500) : size

  const { data, isLoading, isFetching, error, refetch } = useApiQuery<PageResult<CursoCatalogo>>({
    queryKey: ['cursos-catalogo', effectivePage, effectiveSize, sort],
    queryFn: () => listCursosCatalogo({ page: effectivePage, size: effectiveSize, sort }),
  })

  const { mutateAsync: deleteCurso, isPending: isDeleting } = useApiMutation({
    mutationFn: (id: string) => removeCursoCatalogo(id),
    onSuccess: () => {
      notify({ title: 'Curso eliminado', description: 'Se eliminó el curso del catálogo.', variant: 'success' })
      refetch()
    },
    onError: (err) => {
      notify({ title: 'Error al eliminar', description: getErrorMessage(err, 'No fue posible eliminar el curso.'), variant: 'error' })
    },
  })

  const cursos = useMemo(() => data?.content ?? [], [data])
  const filteredCursos = useMemo(() => {
    if (!nombreFilter) return cursos
    const term = normalizeText(nombreFilter)
    return cursos.filter((curso) => {
      const nombre = normalizeText(curso.nombre)
      const nivel = normalizeText(curso.nivelCurso)
      return nombre.includes(term) || nivel.includes(term)
    })
  }, [cursos, nombreFilter])

  const isFiltering = Boolean(nombreFilter)

  const meta = useMemo(() => {
    if (!data) {
      const total = isFiltering ? filteredCursos.length : 0
      return { number: effectivePage, size: effectiveSize, totalElements: total, totalPages: total ? 1 : 0 }
    }
    if (isFiltering) {
      return { number: 0, size: data.size, totalElements: filteredCursos.length, totalPages: filteredCursos.length ? 1 : 0 }
    }
    return { number: data.number, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages }
  }, [data, effectivePage, effectiveSize, filteredCursos.length, isFiltering])

  const displayedTotal = isFiltering ? filteredCursos.length : data?.totalElements ?? 0

  const handleDelete = async (curso: CursoCatalogo) => {
    if (role !== 'admin') {
      notify({ title: 'Acción no permitida', description: 'Solo el rol administrador puede eliminar registros.', variant: 'warning' })
      return
    }
    const confirmed = window.confirm(`¿Deseas eliminar el curso "${curso.nombre}"?`)
    if (!confirmed) return
    await deleteCurso(curso.id)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setNombreFilter(undefined)
    setPage(0)
  }
  const handleNombreChange = (value: string) => {
    setSearchInput(value)
    const trimmed = value.trim()
    setNombreFilter(trimmed.length ? trimmed : undefined)
    setPage(0)
  }

  if (error) {
    return (
      <Page title="" description="">
        <div className="mb-8">
          <div className="flex items-start gap-4">
            {/* INICIALES con paleta anterior */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
              <span className="text-lg font-bold text-white">CC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catálogo de cursos</h1>
              <p className="mt-1 text-gray-600">Gestión de los cursos que pueden ofrecerse</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Error al cargar</h3>
          <p className="mb-6 text-gray-600">
            {getErrorMessage(error, 'No fue posible cargar el catálogo de cursos.')}
          </p>
          <Button variant="secondary" onClick={() => refetch()}>
            <RotateCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </Page>
    )
  }

  return (
    <Page title="" description="">
      {/* Header con paleta anterior */}
      <div className="mb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
              <span className="text-lg font-bold text-white">CC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catálogo de cursos</h1>
              <p className="mt-1 text-gray-600">Gestión de los cursos que pueden ofrecerse</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RotateCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Actualizando...' : 'Recargar'}
            </Button>
            {role === 'admin' && (
              <Button
                onClick={() => navigate('/cursos/nuevo')}
                variant="primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo curso
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tarjeta Panel - paleta anterior */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-400 via-sky-500 to-blue-500 p-1 shadow-[0_20px_40px_-24px_rgba(14,165,233,0.45)]">
          <div className="rounded-2xl bg-white/20 px-6 py-5 backdrop-blur-sm">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/90">PANEL DE CONTROL</p>
                <h2 className="mt-1 text-xl font-bold text-white">Resumen de cursos</h2>
                <p className="mt-2 text-white/95">
                  {displayedTotal} {displayedTotal === 1 ? 'curso registrado' : 'cursos registrados'}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium text-white">Catálogo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros (placeholder “Ej: TAC”) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="curso-search">
                Buscar cursos
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    id="curso-search"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-11 text-gray-900 placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="Ej: TAC"
                    value={searchInput}
                    onChange={(e) => handleNombreChange(e.target.value)}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClearFilters}
                  disabled={!searchInput.trim().length}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
              </div>
            </div>

            <div className="w-full lg:w-64">
              <NiceSelect
                label="Ordenar por"
                value={sort}
                onChange={(val) => {
                  setSort(val)
                  setPage(0)
                }}
                options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>
          </div>
        </div>

        {/* Contador */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{displayedTotal}</span> {displayedTotal === 1 ? 'resultado' : 'resultados'}
          </span>
          {(isLoading || isFetching) && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner size="sm" />
              Cargando...
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Cargando catálogo de cursos...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <Table
              data={filteredCursos}
              columns={columns}
              pagination={
                isFiltering
                  ? undefined
                  : {
                      meta,
                      onPageChange: (nextPage) => setPage(nextPage),
                      onPageSizeChange: (nextSize) => {
                        setSize(nextSize)
                        setPage(0)
                      },
                      pageSizeOptions,
                      isLoading: isLoading || isFetching || isDeleting,
                    }
              }
              getRowKey={(item) => item.id}
              emptyMessage={
                <div className="py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No hay cursos registrados</h3>
                  <p className="mt-2 text-gray-500"></p>
                  {role === 'admin' && (
                    <Button
                      onClick={() => navigate('/cursos/nuevo')}
                      variant="primary"
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar nuevo curso
                    </Button>
                  )}
                </div>
              }
              renderActions={(curso) =>
                role === 'admin' ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/cursos/${curso.id}/editar`)}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(curso)}
                      isLoading={isDeleting}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Eliminar
                    </Button>
                  </div>
                ) : null
              }
            />
          </div>
        )}
      </div>
    </Page>
  )
}

export default CursoCatalogoList
