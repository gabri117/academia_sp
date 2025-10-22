import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import Select from '../../components/form/Select'
import { isApiError } from '../../api/types'
import { useToast } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'
import { useApiMutation, useApiQuery } from '../../hooks'
import type { Grado, Nivel } from '../../contract/moduleA'
import { listGradosByNivel, removeGrado } from '../../services/grados'
import { listNiveles } from '../../services/niveles'

// 🎨 Style kit
import HeroSummary from '@/components/kit/HeroSummary'
import PanelCard from '@/components/kit/PanelCard'
import { cls } from '@/components/ui/stylekit'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const createColumns = (): TableColumn<Grado>[] => [
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
]

const SORT_OPTIONS = [{ label: 'Por defecto', value: 'none' }]

const GradosPorNivel = () => {
  const params = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const role = useAuthStore((state) => state.role)

  const [currentNivelId, setCurrentNivelId] = useState<string | undefined>(params.nivelId)
  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState(SORT_OPTIONS[0].value)

  const { data: niveles } = useApiQuery<Nivel[]>({
    queryKey: ['niveles', 'for-filter'],
    queryFn: () => listNiveles(),
  })

  useEffect(() => {
    if (params.nivelId) {
      setCurrentNivelId(params.nivelId)
    }
  }, [params.nivelId])

  const {
    data: grados,
    isLoading,
    refetch,
  } = useApiQuery<Grado[]>({
    queryKey: ['grados', 'por-nivel', currentNivelId],
    queryFn: () => (currentNivelId ? listGradosByNivel(currentNivelId) : Promise.resolve([])),
    enabled: Boolean(currentNivelId),
  })

  const { mutateAsync: eliminarGrado, isPending } = useApiMutation({
    mutationFn: (gradoId: string) => removeGrado(gradoId),
    onSuccess: () => {
      notify({
        title: 'Grado eliminado',
        description: 'Se eliminó correctamente.',
        variant: 'success',
      })
      refetch()
    },
    onError: (error) => {
      notify({
        title: 'Error al eliminar',
        description: getErrorMessage(error, 'No fue posible eliminar el grado.'),
        variant: 'error',
      })
    },
  })

  const filtered = useMemo(() => {
    if (!searchInput) return grados ?? []
    const value = searchInput.trim().toLowerCase()
    return (grados ?? []).filter((grado) => grado.nombre.toLowerCase().includes(value))
  }, [grados, searchInput])

  const nivelOptions = (niveles ?? []).map((nivel) => ({
    label: nivel.nombre,
    value: nivel.nivelId,
  }))
  const currentNivelNombre = niveles?.find((nivel) => nivel.nivelId === currentNivelId)?.nombre

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
    await eliminarGrado(grado.gradoId)
  }

  // etiquetas del hero
  const filtrosLabel = currentNivelNombre
    ? (searchInput.trim()
        ? `Nivel: ${currentNivelNombre} · Búsqueda: “${searchInput.trim()}”`
        : `Nivel: ${currentNivelNombre}`)
    : 'Sin nivel seleccionado'
  const filtrosAccent: 'white' | 'yellow' | 'orange' =
    !currentNivelNombre ? 'orange' : (searchInput.trim() ? 'yellow' : 'white')
  const totalRegistros = (filtered ?? []).length

  const columns = useMemo(() => createColumns(), [])

  return (
    <Page
      title="Grados por nivel"
      description={
        currentNivelNombre
          ? `Listado de grados del nivel ${currentNivelNombre}.`
          : 'Selecciona un nivel para visualizar sus grados.'
      }
      actions={
        <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
          <Button variant="secondary" onClick={() => refetch()} disabled={!currentNivelId || isLoading}>
            {/* icono recargar */}
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 11a8 8 0 10-1.582 4.418M20 20v-5" />
            </svg>
            Recargar
          </Button>
          <Button onClick={() => navigate('/grados/nuevo')} disabled={!currentNivelId}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12"/></svg>
            Nuevo grado
          </Button>
        </div>
      }
    >
      {/* Resumen superior con gradiente */}
      <HeroSummary
        title="Resumen"
        total={totalRegistros}
        filtersLabel={filtrosLabel}
        filtersAccent={filtrosAccent}
        sort={sort}
        options={SORT_OPTIONS}
        onChangeSort={(v) => setSort(v)}
      />

      {/* Filtros (sticky) */}
      <div className="sticky top-14 z-10">
        <PanelCard className="px-5 py-5">
          <div className="grid gap-4 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <label className="block text-sm font-semibold text-[#2e2e2e]">Nivel</label>
              <Select
                placeholder="Selecciona un nivel"
                options={nivelOptions}
                value={currentNivelId}
                onChange={(event) => {
                  const value = event.target.value || undefined
                  setCurrentNivelId(value)
                  setSearchInput('')
                  if (value) {
                    navigate(`/grados/nivel/${value}`, { replace: true })
                  } else {
                    navigate('/grados/nivel', { replace: true })
                  }
                }}
              />
            </div>
            <div className="md:col-span-7">
              <label className="block text-sm font-semibold text-[#2e2e2e]">Búsqueda</label>
              <input
                className="mt-2 w-full rounded-xl border border-[#cfe0f7] bg-[rgba(229,242,255,0.55)] px-3 py-2 text-sm text-[#1f3c63] shadow-[0_12px_32px_-26px_rgba(0,102,204,0.65)] transition-all focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.35)]"
                placeholder="Buscar por nombre…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                disabled={!currentNivelId}
              />
              <p className="mt-1 text-xs text-[#667085]">
                Filtra localmente sobre el resultado del nivel seleccionado.
              </p>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Contenido principal */}
      {!currentNivelId ? (
        <div className={`${cls.panelCard} mt-4 p-6 text-center text-sm text-gray-600`}>
          Selecciona un nivel para ver sus grados.
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className={`${cls.panelCard} mt-4 p-0`}>
          <Table
            data={filtered}
            columns={columns}
            emptyMessage="Sin grados asociados al nivel seleccionado."
            classNameHeader={cls.tableHeader}
            classNameRow={cls.tableRow}
            renderActions={(grado) => (
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => navigate(`/grados/${grado.gradoId}/editar`)}>
                  Editar
                </Button>
                {role === 'admin' && (
                  <Button variant="danger" size="sm" onClick={() => handleDelete(grado)} isLoading={isPending}>
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          />
        </div>
      )}
    </Page>
  )
}

export default GradosPorNivel
