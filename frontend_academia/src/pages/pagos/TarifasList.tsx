import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import { isApiError } from '../../api/types'

import { useOfertaOptions } from '../../hooks/useCatalogOptions'
import { listarTarifasPorOferta } from '../../services/tarifas'
import type { TarifaCurso } from '../../contract/moduleC'

// 🎨 Style kit reutilizable
import HeroSummary from '@/components/kit/HeroSummary'
import PanelCard from '@/components/kit/PanelCard'
import { cls } from '@/components/ui/stylekit'

type Row = {
  ofertaId: string
  ofertaLabel: string
  tarifa: TarifaCurso | null
  // Campos derivados para cumplir con keyof Row en TableColumn<Row>
  montoInscripcion: number | null
  montoMensualidad: number | null
  acciones: null // placeholder para la columna de acciones
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const TarifasList = () => {
  const navigate = useNavigate()
  const { notify } = useToast()

  const [searchInput, setSearchInput] = useState('')

  const { data: opciones = [], isLoading: isLoadingOfertas, error: ofertasError } = useOfertaOptions()

  const [rows, setRows] = useState<Row[]>([])
  const [loadingTarifas, setLoadingTarifas] = useState(false)

  const filteredRows = useMemo(() => {
    if (!searchInput) return rows
    const lowercasedInput = searchInput.toLowerCase()
    return rows.filter(row => row.ofertaLabel.toLowerCase().includes(lowercasedInput))
  }, [rows, searchInput])

  const columns = useMemo<TableColumn<Row>[]>(() => [
    {
      key: 'ofertaLabel',
      header: 'Oferta',
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(0,102,204,0.12)] text-[#0066cc] text-xs font-bold">
            {r.ofertaLabel.slice(0, 2).toUpperCase()}
          </div>
          <span className="truncate font-semibold text-[#2e2e2e]">{r.ofertaLabel}</span>
        </div>
      ),
    },
    {
      key: 'montoInscripcion',
      header: 'Monto inscripción',
      cellClassName: 'text-center',
      render: (r) =>
        r.montoInscripcion != null
          ? <div className="text-center tabular-nums">Q {Number(r.montoInscripcion).toFixed(2)}</div>
          : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'montoMensualidad',
      header: 'Monto mensualidad',
      cellClassName: 'text-center',
      render: (r) =>
        r.montoMensualidad != null
          ? <div className="text-center tabular-nums">Q {Number(r.montoMensualidad).toFixed(2)}</div>
          : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      cellClassName: 'w-0',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Button
            variant={r.tarifa ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => navigate(`/pagos/tarifas/nueva?ofertaId=${r.ofertaId}`)}
          >
            {r.tarifa ? 'Editar' : 'Agregar'}
          </Button>
        </div>
      ),
    },
  ], [navigate])

  // Cargar TODAS las tarifas (una por oferta) al inicio
  useEffect(() => {
    const loadAll = async () => {
      if (!opciones || opciones.length === 0) {
        setRows([])
        return
      }
      setLoadingTarifas(true)
      try {
        const results: Row[] = await Promise.all(
          opciones.map(async (opt) => {
            const label = `${opt.cursoNombre} - Día: ${opt.dia} | Inicio: ${opt.horaInicio} | Fin: ${opt.horaFin}`
            try {
              const list = await listarTarifasPorOferta(opt.value as any)
              const tarifa = Array.isArray(list) && list.length > 0 ? list[0] : null
              return {
                ofertaId: opt.value,
                ofertaLabel: label,
                tarifa,
                montoInscripcion: tarifa ? tarifa.montoInscripcion : null,
                montoMensualidad: tarifa ? tarifa.montoMensualidad : null,
                acciones: null,
              }
            } catch {
              // Si falla alguna, la mostramos sin tarifa para no romper la tabla
              return {
                ofertaId: opt.value,
                ofertaLabel: label,
                tarifa: null,
                montoInscripcion: null,
                montoMensualidad: null,
                acciones: null,
              }
            }
          })
        )
        setRows(results)
      } catch (e) {
        notify({
          title: 'No se pudieron cargar las tarifas',
          description: getErrorMessage(e, 'Intenta de nuevo o verifica tu conexión.'),
          variant: 'error',
        })
      } finally {
        setLoadingTarifas(false)
      }
    }

    if (!isLoadingOfertas && !ofertasError) {
      void loadAll()
    }
  }, [isLoadingOfertas, ofertasError, opciones, notify])

  const isLoading = isLoadingOfertas || loadingTarifas

  return (
    <Page
      title="Tarifas por oferta"
      description="Listado de todas las ofertas y su tarifa (si existe)."
      actions={
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/pagos/tarifas/nueva')} title="Crear nueva tarifa">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12"/></svg>
            Nueva tarifa
          </Button>
        </div>
      }
    >
      <HeroSummary
        title="Resumen de tarifas"
        total={filteredRows.length}
        filtersLabel={searchInput ? `Búsqueda: “${searchInput}”` : 'Sin filtros'}
        filtersAccent={searchInput ? 'orange' : 'white'}
      />

      <div className="sticky top-14 z-10">
        <PanelCard className="px-5 py-5">
          <form onSubmit={(e) => e.preventDefault()} className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-12">
              <label className="block text-sm font-semibold text-[#2e2e2e]">Búsqueda</label>
              <input
                className="mt-2 w-full rounded-xl border border-[#cfe0f7] bg-[rgba(229,242,255,0.55)] px-3 py-2 text-sm text-[#1f3c63] shadow-[0_12px_32px_-26px_rgba(0,102,204,0.65)] transition-all focus:border-[#3385ff] focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.35)]"
                placeholder="Buscar por nombre de oferta..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </form>
        </PanelCard>
      </div>

      {ofertasError ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(ofertasError, 'No fue posible cargar las ofertas.')}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : filteredRows.length === 0 ? (
        <p className="mt-6 text-sm">No hay ofertas registradas.</p>
      ) : (
        <div className={`${cls.panelCard} mt-4 p-0`}>
          <Table<Row>
            data={filteredRows}
            columns={columns}
            emptyMessage="No hay datos para mostrar."
            getRowKey={(r) => r.ofertaId}
            classNameHeader={cls.tableHeader}
            classNameRow={cls.tableRow}
          />
        </div>
      )}
    </Page>
  )
}

export default TarifasList
