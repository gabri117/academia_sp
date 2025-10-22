import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCw, X, Pencil, Trash2 } from 'lucide-react'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { isApiError } from '../../api/types'
import { useToast } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'
import { useApiMutation, useApiQuery } from '../../hooks'
import type { Nivel } from '../../contract/moduleA'
import { listNiveles, removeNivel } from '../../services/niveles'

// 🎨 Style kit
import HeroSummary from '@/components/kit/HeroSummary'
import PanelCard from '@/components/kit/PanelCard'
import { cls } from '@/components/ui/stylekit'

const SORT_OPTIONS = [{ label: 'Por defecto', value: 'none' }]

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

// columnas (mejoradas visualmente)
const columns: TableColumn<Nivel>[] = [
  {
    key: 'nombre',
    header: 'Nombre',
    render: (n) => (
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(0,102,204,0.12)] text-[#0066cc] text-xs font-bold">
          {n.nombre.slice(0, 2).toUpperCase()}
        </div>
        <span className="truncate font-semibold text-[#2e2e2e]">{n.nombre}</span>
      </div>
    ),
  },
]

const NivelesList = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const role = useAuthStore((state) => state.role)

  const [searchInput, setSearchInput] = useState('')
  const [sort, setSort] = useState(SORT_OPTIONS[0].value)

  const { data, isLoading, error, refetch } = useApiQuery<Nivel[]>({
    queryKey: ['niveles', 'list'],
    queryFn: () => listNiveles(),
  })

  const { mutateAsync: deleteNivel, isPending } = useApiMutation({
    mutationFn: (nivelId: string) => removeNivel(nivelId),
    onSuccess: () => {
      notify({
        title: 'Nivel eliminado',
        description: 'Se eliminó correctamente.',
        variant: 'success',
      })
      refetch()
    },
    onError: (err) => {
      notify({
        title: 'Error al eliminar',
        description: getErrorMessage(err, 'No fue posible eliminar el nivel.'),
        variant: 'error',
      })
    },
  })

  const niveles = useMemo(() => {
    if (!searchInput) return data ?? []
    const value = searchInput.trim().toLowerCase()
    return (data ?? []).filter((nivel) => nivel.nombre.toLowerCase().includes(value))
  }, [data, searchInput])

  const handleDelete = async (nivel: Nivel) => {
    if (role !== 'admin') {
      notify({
        title: 'Acción no permitida',
        description: 'Solo administradores pueden eliminar registros.',
        variant: 'warning',
      })
      return
    }

    const confirmed = window.confirm(`¿Deseas eliminar el nivel ${nivel.nombre}?`)
    if (!confirmed) return
    await deleteNivel(nivel.nivelId)
  }

  // Etiquetas del hero
  const filtrosLabel = searchInput.trim()
    ? `Búsqueda: “${searchInput.trim()}”`
    : 'Sin filtros'
  const filtrosAccent: 'white' | 'yellow' | 'orange' = searchInput.trim() ? 'orange' : 'white'
  const totalRegistros = niveles.length

  return (
    <Page
      title="Niveles"
      description="Gestión de niveles académicos."
      actions={
        <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
          <Button variant="secondary" onClick={() => refetch()}>
            <RotateCw className="mr-2 h-4 w-4" />
            Recargar
          </Button>
          <Button onClick={() => navigate('/niveles/nuevo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo nivel
          </Button>
        </div>
      }
    >
      {/* Resumen superior con gradiente */}
      <HeroSummary
        title="Resumen de niveles"
        total={totalRegistros}
        filtersLabel={filtrosLabel}
        filtersAccent={filtrosAccent}
        sort={sort}
        options={SORT_OPTIONS}
        onChangeSort={(v) => setSort(v)}
      />

      {/* Buscador (sticky) */}
      <div className="sticky top-14 z-10">
        <PanelCard className="px-5 py-5">
          <div className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <label className="block text-sm font-semibold text-[#2e2e2e]">Búsqueda</label>
              <input
                className="mt-2 w-full rounded-xl border border-[#cfe0f7] bg-[rgba(229,242,255,0.55)] px-3 py-2 text-sm text-[#1f3c63] shadow-[0_12px_32px_-26px_rgba(0,102,204,0.65)] transition-all focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.35)]"
                placeholder="Buscar por nombre…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <p className="mt-1 text-xs text-[#667085]">Filtra localmente sobre la lista cargada.</p>
            </div>
            <div className="md:col-span-4 flex gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={() => setSearchInput('')}>
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Mensajes */}
      {error ? (
        <div className={`${cls.panelCard} mt-4 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {getErrorMessage(error, 'No fue posible cargar los niveles.')}
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
        <div className={`${cls.panelCard} mt-4 p-0`}>
          <Table
            data={niveles}
            columns={columns}
            emptyMessage="No hay niveles registrados."
            classNameHeader={cls.tableHeader}
            classNameRow={cls.tableRow}
            renderActions={(nivel) => (
              <div className="flex justify-end gap-2">
                {/* ✅ Botón "Ver" eliminado */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/niveles/${nivel.nivelId}/editar`)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                {role === 'admin' && (
                  <Button variant="danger" size="sm" onClick={() => handleDelete(nivel)} isLoading={isPending}>
                    <Trash2 className="h-4 w-4" />
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

export default NivelesList