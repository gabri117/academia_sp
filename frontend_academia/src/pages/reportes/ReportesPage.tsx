import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  ClipboardList,
  Users,
  UserPlus,
  UserX,
  TrendingUp,
  Award,
  TrendingDown,
  CircleDollarSign,
  CheckCircle,
  Clock,
  Smile,
  Frown,
} from 'lucide-react'

import Page from '../../components/layout/Page'
import Card from '../../components/ui/Card'
import Table, { type TableColumn } from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { useApiQuery } from '../../hooks'
import type {
  PanoramaInscripciones,
  PanoramaInscripcionesFiltro,
  ResumenFinanzas,
  ResumenInstituto,
  TendenciasGenerales,
  OfertaCupoResumen,
  TarifaOfertaResumen,
  EstadoCobranzaItem,
} from '../../services/reportes'
import {
  obtenerOfertasYCupos,
  obtenerPanoramaInscripciones,
  obtenerResumenFinanzas,
  obtenerResumenInstitutos,
  obtenerTendenciasGenerales,
} from '../../services/reportes'
import '../../styles/geometric-animations.css'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value)

const formatPercent = (value: number) =>
  new Intl.NumberFormat('es-GT', { style: 'percent', minimumFractionDigits: 1 }).format(
    Math.min(Math.max(value / 100, 0), 1),
  )

const defaultInscripcionesFiltro: PanoramaInscripcionesFiltro = {
  fechaDesde: '',
  fechaHasta: '',
}

const StatCard = ({ title, value, icon, color }: { title: string, value: React.ReactNode, icon: React.ReactNode, color: any }) => (
  <div className={`rounded-lg border ${color.border} ${color.bg} p-4`}>
    <div className="flex items-center">
      <div className={`rounded-full bg-white p-2`}>{icon}</div>
      <div className="ml-4">
        <p className={`text-xs uppercase ${color.text}`}>{title}</p>
        <p className={`mt-2 text-2xl font-semibold ${color.textValue}`}>{value}</p>
      </div>
    </div>
  </div>
)

type ReportSection = 'panorama' | 'tendencias' | 'finanzas' | 'ofertas' | 'institutos'

const ReportesPage = () => {
  const [filtrosInscripciones, setFiltrosInscripciones] =
    useState<PanoramaInscripcionesFiltro>(defaultInscripcionesFiltro)
  const [filtrosForm, setFiltrosForm] =
    useState<PanoramaInscripcionesFiltro>(defaultInscripcionesFiltro)
  const [activeSection, setActiveSection] = useState<ReportSection | null>('panorama')

  const {
    data: resumenInstitutos,
    isLoading: loadingInstitutos,
    error: errorInstitutos,
  } = useApiQuery<ResumenInstituto[]>(({
    queryKey: ['reportes', 'institutos'],
    queryFn: obtenerResumenInstitutos,
  }))

  const {
    data: panoramaInscripciones,
    isLoading: loadingInscripciones,
    error: errorInscripciones,
    refetch: refetchInscripciones,
    isFetching: fetchingInscripciones,
  } = useApiQuery<PanoramaInscripciones>({
    queryKey: ['reportes', 'inscripciones', filtrosInscripciones],
    queryFn: () => obtenerPanoramaInscripciones(filtrosInscripciones),
  })

  const {
    data: resumenFinanzas,
    isLoading: loadingFinanzas,
    error: errorFinanzas,
    refetch: refetchFinanzas,
    isFetching: fetchingFinanzas,
  } = useApiQuery<ResumenFinanzas>({
    queryKey: ['reportes', 'finanzas'],
    queryFn: obtenerResumenFinanzas,
  })

  const {
    data: resumenOfertas,
    isLoading: loadingOfertas,
    error: errorOfertas,
  } = useApiQuery<OfertaCupoResumen[]>(({
    queryKey: ['reportes', 'ofertas'],
    queryFn: obtenerOfertasYCupos,
  }))

  const {
    data: tendenciasGenerales,
    isLoading: loadingTendencias,
    error: errorTendencias,
  } = useApiQuery<TendenciasGenerales>({
    queryKey: ['reportes', 'tendencias'],
    queryFn: obtenerTendenciasGenerales,
  })

  const columnasInstitutos: TableColumn<ResumenInstituto>[] = useMemo(
    () => [
      { key: 'nombre', header: 'Instituto' },
      {
        key: 'totalAlumnos',
        header: 'Alumnos',
        render: (item) => item.totalAlumnos.toLocaleString(),
      },
      {
        key: 'activos',
        header: 'Activos',
        render: (item) => item.activos.toLocaleString(),
      },
      {
        key: 'inactivos',
        header: 'Inactivos',
        render: (item) => item.inactivos.toLocaleString(),
      },
      {
        key: 'nuevosUltimoMes',
        header: 'Nuevos (30 dias)',
        render: (item) => item.nuevosUltimoMes.toLocaleString(),
      },
      {
        key: 'grados',
        header: 'Distribucion por grado',
        render: (item) =>
          item.grados.length === 0 ? (
            <span className="text-xs text-gray-500">Sin datos</span>
          ) : (
            <ul className="space-y-1 text-xs">
              {item.grados.map((grado) => (
                <li key={`${item.institutoId}-${grado.gradoId}`} className="flex justify-between">
                  <span className="font-medium text-gray-700">{grado.gradoNombre}</span>
                  <span>{grado.total}</span>
                </li>
              ))}
            </ul>
          ),
      },
    ],
    [],
  )

  const columnasTarifas: TableColumn<TarifaOfertaResumen>[] = useMemo(
    () => [
      { key: 'ofertaNombre', header: 'Oferta' },
      {
        key: 'montoInscripcion',
        header: 'Inscripcion',
        render: (item) => formatCurrency(item.montoInscripcion),
      },
      {
        key: 'montoMensualidad',
        header: 'Mensualidad',
        render: (item) => formatCurrency(item.montoMensualidad),
      },
      {
        key: 'inscritos',
        header: 'Inscritos',
        render: (item) => item.inscritos.toLocaleString(),
      },
      {
        key: 'totalGenerado',
        header: 'Generado (mes)',
        render: (item) => formatCurrency(item.totalGenerado),
      },
      {
        key: 'totalPagado',
        header: 'Pagado (mes)',
        render: (item) => formatCurrency(item.totalPagado),
      },
    ],
    [],
  )

  const columnasCobranza: TableColumn<EstadoCobranzaItem>[] = useMemo(
    () => [
      { key: 'alumnoNombre', header: 'Alumno' },
      { key: 'ofertaNombre', header: 'Oferta' },
      {
        key: 'estado',
        header: 'Estado',
        render: (item) => (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              item.estado === 'al-dia'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {item.estado === 'al-dia' ? 'Al dia' : 'Pendiente'}
          </span>
        ),
      },
      {
        key: 'fechaUltimoRecibo',
        header: 'Ultimo recibo',
        render: (item) =>
          item.fechaUltimoRecibo
            ? format(new Date(item.fechaUltimoRecibo), 'yyyy-MM-dd')
            : 'Sin registro',
      },
    ],
    [],
  )

  const columnasOfertas: TableColumn<OfertaCupoResumen>[] = useMemo(
    () => [
      { key: 'ofertaNombre', header: 'Oferta' },
      {
        key: 'capacidad',
        header: 'Cupo',
        render: (item) => item.capacidad.toLocaleString(),
      },
      {
        key: 'inscritos',
        header: 'Inscritos',
        render: (item) => item.inscritos.toLocaleString(),
      },
      {
        key: 'ocupacion',
        header: 'Ocupacion',
        render: (item) => formatPercent(item.ocupacion),
      },
      {
        key: 'diasParaLlenar',
        header: 'Estimacion dias para llenar',
        render: (item) =>
          item.diasParaLlenar ? `${item.diasParaLlenar.toLocaleString()} dias` : 'Sin estimacion',
      },
    ],
    [],
  )

  const columnasSerieLabel = useMemo<TableColumn<{ label: string; valor: number }>[]>(
    () => [
      { key: 'label', header: 'Categoria' },
      {
        key: 'valor',
        header: 'Valor',
        render: (item) => item.valor.toLocaleString('es-GT', { maximumFractionDigits: 2 }),
      },
    ],
    [],
  )

  const columnasSerieTemporal = useMemo<TableColumn<{ periodo: string; valor: number }>[]>(
    () => [
      { key: 'periodo', header: 'Periodo' },
      {
        key: 'valor',
        header: 'Valor',
        render: (item) => item.valor.toLocaleString('es-GT', { maximumFractionDigits: 2 }),
      },
    ],
    [],
  )

  const handleInscripcionesSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFiltrosInscripciones(filtrosForm)
    void refetchInscripciones()
  }

  const handleLimpiarFiltros = () => {
    setFiltrosForm(defaultInscripcionesFiltro)
    setFiltrosInscripciones(defaultInscripcionesFiltro)
    void refetchInscripciones()
  }

  const toggleSection = (section: ReportSection) => {
    setActiveSection((prev) => (prev === section ? null : section))
  }

  const isSectionOpen = (section: ReportSection) => activeSection === section

  return (
    <Page
      title="Reportes"
      description="Panel consolidado de indicadores academicos y financieros."
      actions={
        <Button variant="secondary" onClick={() => void refetchFinanzas()} disabled={fetchingFinanzas}>
          {fetchingFinanzas ? 'Actualizando...' : 'Refrescar finanzas'}
        </Button>
      }
    >
      <div className="relative min-h-screen">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]" />
        </div>
        <div className="space-y-6">
          <Card
            title="Panorama de inscripciones"
            description="Inscripciones por grado y oferta en un periodo determinado."
            color={{ bg: 'bg-sky-50', border: 'border-sky-200' }}
            collapsible
            isCollapsed={!isSectionOpen('panorama')}
            onToggle={() => toggleSection('panorama')}
            actions={
              isSectionOpen('panorama') ? (
                <form className="flex flex-wrap items-center gap-2" onSubmit={handleInscripcionesSubmit}>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    Desde
                    <input
                      type="date"
                      value={filtrosForm.fechaDesde ?? ''}
                      onChange={(event) =>
                        setFiltrosForm((prev) => ({ ...prev, fechaDesde: event.target.value }))
                      }
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    Hasta
                    <input
                      type="date"
                      value={filtrosForm.fechaHasta ?? ''}
                      onChange={(event) =>
                        setFiltrosForm((prev) => ({ ...prev, fechaHasta: event.target.value }))
                      }
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <Button type="submit" isLoading={fetchingInscripciones}>
                    Aplicar
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleLimpiarFiltros}>
                    Limpiar
                  </Button>
                </form>
              ) : undefined
            }
          >
            {loadingInscripciones ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : errorInscripciones ? (
              <p className="text-sm text-red-600">
                No fue posible cargar el panorama de inscripciones. Verifica tu conexion.
              </p>
            ) : panoramaInscripciones ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard
                    title="Inscripciones"
                    value={panoramaInscripciones.resumen.totalInscripciones.toLocaleString()}
                    icon={<ClipboardList className="h-6 w-6 text-slate-500" />}
                    color={{
                      border: 'border-slate-200',
                      bg: 'bg-slate-50',
                      text: 'text-slate-500',
                      textValue: 'text-slate-800',
                    }}
                  />
                  <StatCard
                    title="Alumnos unicos"
                    value={panoramaInscripciones.resumen.totalAlumnos.toLocaleString()}
                    icon={<Users className="h-6 w-6 text-emerald-600" />}
                    color={{
                      border: 'border-emerald-200',
                      bg: 'bg-emerald-50',
                      text: 'text-emerald-600',
                      textValue: 'text-emerald-700',
                    }}
                  />
                  <StatCard
                    title="Nuevas"
                    value={panoramaInscripciones.resumen.nuevas.toLocaleString()}
                    icon={<UserPlus className="h-6 w-6 text-blue-600" />}
                    color={{
                      border: 'border-blue-200',
                      bg: 'bg-blue-50',
                      text: 'text-blue-600',
                      textValue: 'text-blue-700',
                    }}
                  />
                  <StatCard
                    title="Canceladas"
                    value={panoramaInscripciones.resumen.canceladas.toLocaleString()}
                    icon={<UserX className="h-6 w-6 text-rose-600" />}
                    color={{
                      border: 'border-rose-200',
                      bg: 'bg-rose-50',
                      text: 'text-rose-600',
                      textValue: 'text-rose-700',
                    }}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">Por grado</h3>
                    <Table
                      data={panoramaInscripciones.porGrado}
                      columns={columnasSerieLabel}
                      getRowKey={(item) => `grado-${item.label}`}
                      emptyMessage="Sin inscripciones en el rango seleccionado."
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">Por oferta</h3>
                    <Table
                      data={panoramaInscripciones.porOferta}
                      columns={columnasSerieLabel}
                      getRowKey={(item) => `oferta-${item.label}`}
                      emptyMessage="Sin inscripciones en el rango seleccionado."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay datos disponibles.</p>
            )}
          </Card>
          <Card
            title="Tendencias generales"
            description="Medicion mensual de matriculas, ingresos y desempeno academico."
            color={{ bg: 'bg-amber-50', border: 'border-amber-200' }}
            collapsible
            isCollapsed={!isSectionOpen('tendencias')}
            onToggle={() => toggleSection('tendencias')}
          >
            {loadingTendencias ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : errorTendencias ? (
              <p className="text-sm text-red-600">
                No fue posible cargar las tendencias generales. Intenta nuevamente.
              </p>
            ) : tendenciasGenerales ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard
                    title="Promedio calificaciones"
                    value={
                      tendenciasGenerales.promedioCalificaciones !== null
                        ? tendenciasGenerales.promedioCalificaciones.toLocaleString('es-GT', {
                            minimumFractionDigits: 2,
                          })
                        : 'Sin datos'
                    }
                    icon={<TrendingUp className="h-6 w-6 text-slate-500" />}
                    color={{
                      border: 'border-slate-200',
                      bg: 'bg-slate-50',
                      text: 'text-slate-500',
                      textValue: 'text-slate-800',
                    }}
                  />
                  <StatCard
                    title="Nota maxima"
                    value={
                      tendenciasGenerales.calificacionMaxima !== null
                        ? tendenciasGenerales.calificacionMaxima.toLocaleString('es-GT', {
                            minimumFractionDigits: 2,
                          })
                        : 'Sin datos'
                    }
                    icon={<Award className="h-6 w-6 text-emerald-600" />}
                    color={{
                      border: 'border-emerald-200',
                      bg: 'bg-emerald-50',
                      text: 'text-emerald-600',
                      textValue: 'text-emerald-700',
                    }}
                  />
                  <StatCard
                    title="Nota minima"
                    value={
                      tendenciasGenerales.calificacionMinima !== null
                        ? tendenciasGenerales.calificacionMinima.toLocaleString('es-GT', {
                            minimumFractionDigits: 2,
                          })
                        : 'Sin datos'
                    }
                    icon={<TrendingDown className="h-6 w-6 text-rose-600" />}
                    color={{
                      border: 'border-rose-200',
                      bg: 'bg-rose-50',
                      text: 'text-rose-600',
                      textValue: 'text-rose-700',
                    }}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">
                      Matriculas mensuales
                    </h3>
                    <Table
                      data={tendenciasGenerales.matriculasMensuales}
                      columns={columnasSerieTemporal}
                      getRowKey={(item) => `mat-${item.periodo}`}
                      emptyMessage="Sin registros de matriculas."
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">
                      Ingresos mensuales
                    </h3>
                    <Table
                      data={tendenciasGenerales.ingresosMensuales}
                      columns={columnasSerieTemporal}
                      getRowKey={(item) => `ing-${item.periodo}`}
                      emptyMessage="Sin registros de ingresos."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay datos disponibles.</p>
            )}
          </Card>
          <Card
            title="Tarifas y pagos"
            description="Comportamiento de cobros y pagos de mensualidades del mes en curso."
            color={{ bg: 'bg-rose-50', border: 'border-rose-200' }}
            collapsible
            isCollapsed={!isSectionOpen('finanzas')}
            onToggle={() => toggleSection('finanzas')}
            actions={
              isSectionOpen('finanzas') ? (
                <Button variant="secondary" onClick={() => void refetchFinanzas()} disabled={fetchingFinanzas}>
                  {fetchingFinanzas ? 'Actualizando...' : 'Refrescar'}
                </Button>
              ) : undefined
            }
          >
            {loadingFinanzas ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : errorFinanzas ? (
              <p className="text-sm text-red-600">
                No fue posible cargar el resumen de finanzas. Intenta nuevamente.
              </p>
            ) : resumenFinanzas ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard
                    title="Generado"
                    value={formatCurrency(resumenFinanzas.resumen.totalGenerado)}
                    icon={<CircleDollarSign className="h-6 w-6 text-slate-500" />}
                    color={{
                      border: 'border-slate-200',
                      bg: 'bg-slate-50',
                      text: 'text-slate-500',
                      textValue: 'text-slate-800',
                    }}
                  />
                  <StatCard
                    title="Pagado"
                    value={formatCurrency(resumenFinanzas.resumen.totalPagado)}
                    icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
                    color={{
                      border: 'border-emerald-200',
                      bg: 'bg-emerald-50',
                      text: 'text-emerald-600',
                      textValue: 'text-emerald-700',
                    }}
                  />
                  <StatCard
                    title="Pendiente"
                    value={formatCurrency(resumenFinanzas.resumen.totalPendiente)}
                    icon={<Clock className="h-6 w-6 text-amber-600" />}
                    color={{
                      border: 'border-amber-200',
                      bg: 'bg-amber-50',
                      text: 'text-amber-600',
                      textValue: 'text-amber-700',
                    }}
                  />
                  <StatCard
                    title="Alumnos al dia"
                    value={resumenFinanzas.resumen.alumnosAlDia.toLocaleString()}
                    icon={<Smile className="h-6 w-6 text-emerald-600" />}
                    color={{
                      border: 'border-emerald-200',
                      bg: 'bg-emerald-50',
                      text: 'text-emerald-600',
                      textValue: 'text-emerald-700',
                    }}
                  />
                  <StatCard
                    title="Alumnos pendientes"
                    value={resumenFinanzas.resumen.alumnosPendientes.toLocaleString()}
                    icon={<Frown className="h-6 w-6 text-rose-600" />}
                    color={{
                      border: 'border-rose-200',
                      bg: 'bg-rose-50',
                      text: 'text-rose-600',
                      textValue: 'text-rose-700',
                    }}
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">Tarifas por oferta</h3>
                    <Table
                      data={resumenFinanzas.detalleTarifas}
                      columns={columnasTarifas}
                      getRowKey={(item) => item.ofertaId}
                      emptyMessage="No hay tarifas registradas."
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-700">Estado de cobranza</h3>
                    <Table
                      data={resumenFinanzas.estadoCobranza}
                      columns={columnasCobranza}
                      getRowKey={(item, index) => `${item.alumnoId}-${index}`}
                      emptyMessage="No hay estudiantes registrados para cobranza."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay datos disponibles.</p>
            )}
          </Card>
          <Card
            title="Ofertas y cupos"
            description="Seguimiento de ocupacion y ritmo de llenado de las ofertas activas."
            color={{ bg: 'bg-emerald-50', border: 'border-emerald-200' }}
            collapsible
            isCollapsed={!isSectionOpen('ofertas')}
            onToggle={() => toggleSection('ofertas')}
          >
            {loadingOfertas ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : errorOfertas ? (
              <p className="text-sm text-red-600">
                No fue posible cargar el estado de las ofertas. Verifica tu conexion.
              </p>
            ) : (
              <Table
                data={resumenOfertas ?? []}
                columns={columnasOfertas}
                getRowKey={(item) => item.ofertaId}
                emptyMessage="No hay ofertas registradas."
              />
            )}
          </Card>
          <Card
            title="Totales por instituto"
            description="Distribucion de alumnos por estado y grado."
            color={{ bg: 'bg-indigo-50', border: 'border-indigo-200' }}
            collapsible
            isCollapsed={!isSectionOpen('institutos')}
            onToggle={() => toggleSection('institutos')}
          >
            {loadingInstitutos ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : errorInstitutos ? (
              <p className="text-sm text-red-600">
                No fue posible cargar el resumen de institutos. Intenta nuevamente mas tarde.
              </p>
            ) : (
              <Table
                data={resumenInstitutos ?? []}
                columns={columnasInstitutos}
                getRowKey={(item) => item.institutoId}
                emptyMessage="No se encontraron institutos registrados."
              />
            )}
          </Card>
        </div>
      </div>
    </Page>
  )
}

export default ReportesPage
