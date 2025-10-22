import { useMemo, useState } from 'react'
import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Table, { type TableColumn } from '@/components/ui/Table'
import HeroSummary from '@/components/kit/HeroSummary'
import PanelCard from '@/components/kit/PanelCard'
import { Chip } from '@/components/kit/Chip'
import BadgeEstado from '@/components/kit/BadgeEstado'
import { cls } from '@/components/ui/stylekit'

// Reemplaza estos tipos y fuentes de datos por los tuyos
type Item = { id: string; nombre: string; fecha?: string | null; estado?: string | null }
const SORT_OPTIONS = [
  { label: 'Más recientes', value: 'fecha,desc' },
  { label: 'Más antiguo', value: 'fecha,asc' },
]

export default function GenericListPage() {
  // estado UI
  const [sort, setSort] = useState(SORT_OPTIONS[0].value)
  const [estado, setEstado] = useState<'activo'|'inactivo'|'todos'>('activo')

  // data (simulada)
  const data: Item[] = [] // <-- trae tu data real
  const filtered = useMemo(() => {
    if (estado === 'todos') return data
    return data.filter(d => (d.estado ?? '').toLowerCase() === estado)
  }, [data, estado])

  // columnas
  const columns = useMemo<TableColumn<Item>[]>(() => ([
    { key: 'nombre', header: 'Nombre', render: (i) => <span className="text-[#2e2e2e]">{i.nombre}</span> },
    { key: 'fecha', header: 'Fecha', render: (i) => <span className="text-[#666] whitespace-nowrap">{i.fecha?.slice(0,10) ?? '-'}</span>, cellClassName:'w-0' },
    { key: 'estado', header: 'Estado', render: (i) => <BadgeEstado value={i.estado} />, cellClassName:'w-0' },
  ]), [])

  // helpers visuales
  const filtrosLabel = estado === 'todos' ? 'Sin filtros' : estado === 'activo' ? 'Activos' : 'Inactivos'
  const filtrosAccent: 'white'|'yellow'|'orange' =
    filtrosLabel === 'Sin filtros' ? 'white' : estado === 'activo' ? 'yellow' : 'orange'

  return (
    <Page
      title="Título de la página"
      description="Descripción corta"
      actions={
        <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
          <Button onClick={() => { /* refetch */ }}>Recargar</Button>
          <Button onClick={() => { /* navigate a crear */ }}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12"/></svg>
            Nuevo
          </Button>
        </div>
      }
    >
      <HeroSummary
        title="Resumen"
        total={filtered.length}
        filtersLabel={filtrosLabel}
        filtersAccent={filtrosAccent}
        sort={sort}
        options={SORT_OPTIONS}
        onChangeSort={(v) => setSort(v)}
      />

      {/* Filtros */}
      <div className="sticky top-14 z-10">
        <PanelCard className="px-5 py-5">
          <div className="grid gap-5 md:grid-cols-12 md:items-end">
            <div className="md:col-span-12">
              <span className="block text-sm font-semibold text-[#2e2e2e]">Estado</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['activo','inactivo','todos'] as const).map(opt => (
                  <Chip key={opt} active={estado===opt} onClick={() => setEstado(opt)}>
                    {opt==='activo'?'Activos':opt==='inactivo'?'Inactivos':'Todos'}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Tabla */}
      <div className={`${cls.panelCard} mt-4 p-0`}>
        {/* reemplaza por estado real de carga */}
        {false ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <Table
            data={filtered}
            columns={columns}
            getRowKey={(i) => i.id}
            emptyMessage="No hay datos."
            classNameHeader={cls.tableHeader}
            classNameRow={cls.tableRow}
            density="compact"
            // pagination={...} (si te aplica)
          />
        )}
      </div>
    </Page>
  )
}
