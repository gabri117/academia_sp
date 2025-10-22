import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Printer, Eye, Ban } from 'lucide-react'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Table, { type TableColumn } from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'
import PanelCard from '@/components/kit/PanelCard'
import HeroSummary from '@/components/kit/HeroSummary'
import { cls } from '@/components/ui/stylekit'
import NiceSelect from '@/components/ui/NiceSelect'
import type { SelectOption } from '../../hooks/useCatalogOptions'
import { isApiError } from '../../api/types'
import type {
  Cargo,
  ReciboConOfertasDTO,
  ReciboEstado,
  ReciboOfertaDetalleDTO,
  TarifaCurso,
} from '../../contract/moduleC'
import type { UUID, Establecimiento, Grado } from '../../contract/moduleA'
import type { CursoCatalogo, OfertaCurso } from '../../contract/moduleB'
import { listarRecibosConOfertas, actualizarRecibo } from '../../services/recibos'
import { listarDetalleReciboPorRecibo } from '../../services/detalleRecibo'
import { obtenerCargo } from '../../services/cargos'
import { obtenerTarifaCurso } from '../../services/tarifas'
import { getOfertaCurso } from '../../services/ofertas'
import { getCursoCatalogo } from '../../services/cursosCatalogo'
import { getEstablecimiento } from '../../services/establecimientos'
import { listAlumnos } from '../../services/alumnos'
import { listEncargadosPorAlumno } from '../../services/alumnoEncargado'
import { getGrado } from '../../services/grados'
import {
  formatCurrency,
  formatPaymentCount,
  generarReciboPdf,
  type ReciboPdfData,
  type ReciboPdfDetalle,
} from '../../utils/recibosPdf'

type ReciboListado = ReciboConOfertasDTO & { alumnoLabel: string } & Record<string, unknown>
type DetalleModalData = Omit<ReciboPdfData, 'estado'> & { estado: ReciboEstado | null }

const ESTADO_TODOS = 'TODOS' as const
type EstadoFiltro = ReciboEstado | typeof ESTADO_TODOS
type CorrelativoOrden = 'asc' | 'desc'

const ESTADO_OPTIONS: Array<{ label: string; value: EstadoFiltro }> = [
  { label: 'Emitidos', value: 'EMITIDO' },
  { label: 'Anulados', value: 'ANULADO' },
  { label: 'Todos', value: ESTADO_TODOS },
]

const CORRELATIVO_ORDEN_OPTIONS: Array<{ label: string; value: CorrelativoOrden }> = [
  { label: 'Mas recientes primero', value: 'desc' },
  { label: 'Mas antiguos primero', value: 'asc' },
]

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (error instanceof Error) return error.message
  return fallback
}

const parseCorrelativo = (value: string | null | undefined): number | null => {
  if (!value) return null
  const digits = value.replace(/\D+/g, '')
  if (digits.length === 0) return null
  const num = Number.parseInt(digits, 10)
  return Number.isFinite(num) ? num : null
}

const RecibosList = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [alumnoOptionsBase, setAlumnoOptionsBase] = useState<SelectOption[]>([])
  const [recibos, setRecibos] = useState<ReciboConOfertasDTO[]>([])
  const [loadingRecibos, setLoadingRecibos] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [alumnoSearch, setAlumnoSearch] = useState('')
  const [showAlumnoDropdown, setShowAlumnoDropdown] = useState(false)
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>('')
  const [selectedOfertaId, setSelectedOfertaId] = useState<string>('')
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('EMITIDO')
  const [correlativoOrden, setCorrelativoOrden] = useState<CorrelativoOrden>('desc')
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [detalleCargando, setDetalleCargando] = useState(false)
  const [detalleError, setDetalleError] = useState<string | null>(null)
  const [detalleDatos, setDetalleDatos] = useState<DetalleModalData | null>(null)
  const [cancelandoId, setCancelandoId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const fetchAlumnos = async () => {
      try {
        const pageSize = 200
        let page = 0
        const options: SelectOption[] = []
        while (true) {
          const response = await listAlumnos({ page, size: pageSize, sort: 'nombre,asc' })
          const content = response?.content ?? []
          content.forEach((alumno) => {
            const nombre = [alumno.nombre, alumno.apellido]
              .filter(Boolean)
              .map((part) => part?.trim())
              .filter((part): part is string => Boolean(part && part.length > 0))
              .join(' ')
            const carnet = alumno.carnet?.trim() ?? ''
            const baseLabel =
              nombre.length > 0
                ? nombre
                : `Alumno ${String(alumno.id).slice(0, 8).toUpperCase()}`
            const label = carnet.length > 0 ? `${baseLabel} - Carnet: ${carnet}` : baseLabel
            options.push({ value: String(alumno.id), label })
          })
          if (content.length < pageSize) break
          page += 1
        }
        if (!active) return
        setAlumnoOptionsBase(options)
      } catch (error) {
        notify({
          title: 'Alumnos',
          description: getErrorMessage(error, 'No fue posible cargar la lista de alumnos.'),
          variant: 'error',
        })
      }
    }
    void fetchAlumnos()
    return () => {
      active = false
    }
  }, [notify])

  const fetchRecibos = useCallback(async () => {
    setLoadingRecibos(true)
    setLoadError(null)
    try {
      const data = await listarRecibosConOfertas({
        alumnoId: selectedAlumnoId || undefined,
        estado: estadoFiltro === ESTADO_TODOS ? undefined : estadoFiltro,
      })
      setRecibos(Array.isArray(data) ? data : [])
    } catch (error) {
      setLoadError(getErrorMessage(error, 'No fue posible cargar los recibos.'))
    } finally {
      setLoadingRecibos(false)
    }
  }, [estadoFiltro, selectedAlumnoId])

  useEffect(() => {
    void fetchRecibos()
  }, [fetchRecibos, reloadKey])

  useEffect(() => {
    setSelectedOfertaId('')
  }, [selectedAlumnoId])

  useEffect(() => {
    const toHydrate = recibos.filter(
      (recibo) => Boolean(recibo.reciboId) && (recibo.ofertas?.length ?? 0) === 0,
    )
    if (toHydrate.length === 0) {
      return
    }

    let canceled = false
    const createResolver = <T,>(loader: (id: string) => Promise<T>) => {
      const cache = new Map<string, Promise<T | null>>()
      return (id: string) => {
        if (!cache.has(id)) {
          cache.set(
            id,
            loader(id).catch(() => null),
          )
        }
        const promise = cache.get(id)
        return promise ?? Promise.resolve(null)
      }
    }

    const resolveCargo = createResolver<Cargo>((cargoId) => obtenerCargo(cargoId as UUID))
    const resolveTarifa = createResolver<TarifaCurso>((tarifaId) =>
      obtenerTarifaCurso(tarifaId as UUID),
    )
    const resolveOferta = createResolver<OfertaCurso>((ofertaId) =>
      getOfertaCurso(ofertaId as UUID),
    )
    const resolveCursoNombre = createResolver<CursoCatalogo>((cursoId) =>
      getCursoCatalogo(cursoId as UUID),
    )
    const resolveInstitutoNombre = createResolver<Establecimiento>((institutoId) =>
      getEstablecimiento(institutoId as UUID),
    )
    const resolveGradoNombre = createResolver<Grado>((gradoId) => getGrado(gradoId as UUID))
    
    const normalizarHora = (value?: string | null) => {
      if (!value) return null
      return value.length > 5 ? value.slice(0, 5) : value
    }

    const hydrate = async () => {
      const updates = await Promise.all(
        toHydrate.map(async (recibo) => {
          if (!recibo.reciboId) return null
          const detalles = await listarDetalleReciboPorRecibo(recibo.reciboId)
          if (!Array.isArray(detalles) || detalles.length === 0) {
            return null
          }
          const ofertasMap = new Map<string, ReciboOfertaDetalleDTO>()
          for (const detalle of detalles) {
            const cargoId = detalle.cargoId ? String(detalle.cargoId) : null
            if (!cargoId) continue
            const cargo = await resolveCargo(cargoId)
            const tarifaId = cargo?.tarifaId ? String(cargo.tarifaId) : null
            if (!tarifaId) continue
            const tarifa = await resolveTarifa(tarifaId)
            const ofertaId = tarifa?.ofertaId ? String(tarifa.ofertaId) : null
            if (!ofertaId || ofertasMap.has(ofertaId)) continue
            const oferta = await resolveOferta(ofertaId)
            if (!oferta) continue
            const cursoId = oferta.cursoId ? String(oferta.cursoId) : null
            const institutoId = oferta.institutoId ? String(oferta.institutoId) : null
            const gradoId = oferta.gradoId ? String(oferta.gradoId) : null
            const curso = cursoId ? await resolveCursoNombre(cursoId) : null
            const instituto = institutoId ? await resolveInstitutoNombre(institutoId) : null
            const grado = gradoId ? await resolveGradoNombre(gradoId) : null
            const nombreOferta =
              curso?.nombre?.trim() && curso.nombre.trim().length > 0
                ? curso.nombre.trim()
                : `Oferta ${ofertaId.slice(0, 8).toUpperCase()}`
            ofertasMap.set(ofertaId, {
              ofertaId,
              nombreOferta,
              dia: oferta.dia ?? null,
              horaInicio: normalizarHora(oferta.horaInicio ?? null),
              horaFinalizacion: normalizarHora(oferta.horaFinalizacion ?? null),
              institutoId: institutoId ?? null,
              institutoNombre:
                instituto?.nombre?.trim() && instituto.nombre.trim().length > 0
                  ? instituto.nombre.trim()
                  : null,
              gradoNombre:
                grado?.nombre?.trim() && grado.nombre.trim().length > 0 ? grado.nombre.trim() : null,
            })
          }

          if (ofertasMap.size === 0) {
            return null
          }

          return {
            reciboId: String(recibo.reciboId),
            ofertas: Array.from(ofertasMap.values()),
          }
        }),
      )
      if (canceled) return
      const updatesMap = new Map<string, ReciboOfertaDetalleDTO[]>()
      updates
        .filter((item): item is { reciboId: string; ofertas: ReciboOfertaDetalleDTO[] } => Boolean(item))
        .forEach((item) => {
          updatesMap.set(item.reciboId, item.ofertas)
        })

      if (updatesMap.size === 0) return
      setRecibos((prev) =>
        prev.map((recibo) => {
          const key = recibo.reciboId ? String(recibo.reciboId) : null
          if (!key) return recibo
          const nuevasOfertas = updatesMap.get(key)
          if (!nuevasOfertas) return recibo
          return {
            ...recibo,
            ofertas: nuevasOfertas,
          }
        }),
      )
    }

    void hydrate()

    return () => {
      canceled = true
    }
  }, [recibos])

  const loadDetalleRecibo = useCallback(
    async (recibo: ReciboListado): Promise<DetalleModalData> => {
      if (!recibo.reciboId) {
        throw new Error('El recibo seleccionado no tiene un identificador válido.')
      }

      const reciboId = recibo.reciboId as UUID
      const alumnoId = recibo.alumnoId as UUID
      const [detallesResponse, encargadosResponse] = await Promise.all([
        listarDetalleReciboPorRecibo(reciboId),
        listEncargadosPorAlumno(alumnoId).catch(() => []),
      ])
      const encargados =
        Array.isArray(encargadosResponse) && encargadosResponse.length > 0
          ? encargadosResponse
              .map((item) => item.encargadoNombreCompleto?.trim())
              .filter((nombre): nombre is string => Boolean(nombre && nombre.length > 0))
          : []
      const detallesArray = Array.isArray(detallesResponse) ? detallesResponse : []
      const detallesCompletos: ReciboPdfDetalle[] = await Promise.all(
        detallesArray.map(async (detalle) => {
          try {
            const cargo = await obtenerCargo(detalle.cargoId as UUID)
            const montoOriginal =
              cargo && typeof cargo.monto === 'number' ? Number(cargo.monto) : null
            const montoAplicado =
              typeof detalle.montoAplicado === 'number'
                ? detalle.montoAplicado
                : montoOriginal
            return {
              cargoId: String(detalle.cargoId),
              periodoMes: cargo?.periodoMes ?? null,
              concepto:
                cargo?.concepto?.trim() && cargo.concepto.trim().length > 0
                  ? cargo.concepto.trim()
                  : null,
              montoOriginal,
              montoAplicado: typeof montoAplicado === 'number' ? montoAplicado : null,
            }
          } catch {
            return {
              cargoId: String(detalle.cargoId),
              periodoMes: null,
              concepto: null,
              montoOriginal: null,
              montoAplicado:
                typeof detalle.montoAplicado === 'number' ? detalle.montoAplicado : null,
            }
          }
        }),
      )

      const montoBaseCandidates = detallesCompletos
        .map((detalle) => detalle.montoOriginal)
        .filter((value): value is number => typeof value === 'number')
      const montoBase = montoBaseCandidates.length > 0 ? montoBaseCandidates[0] : null
      const totalDetalles = detallesCompletos.reduce((acc, detalle) => {
        const monto = typeof detalle.montoAplicado === 'number' ? detalle.montoAplicado : 0
        return acc + monto
      }, 0)
      const totalRecibo =
        typeof recibo.total === 'number'
          ? recibo.total
          : detallesCompletos.length > 0
            ? totalDetalles
            : null
      const numeroPagos =
        typeof totalRecibo === 'number' && typeof montoBase === 'number' && montoBase > 0
          ? totalRecibo / montoBase
          : null
      return {
        correlativo: recibo.correlativoRecibo ?? null,
        alumnoNombre: recibo.alumnoLabel,
        encargados,
        fechaEmision: recibo.fecha ?? null,
        estado: recibo.estado ?? null,
        total: totalRecibo,
        montoBase,
        numeroPagos,
        ofertas: recibo.ofertas.map((oferta) => ({
          ofertaId: oferta.ofertaId,
          nombre: oferta.nombreOferta,
          instituto: oferta.institutoNombre ?? null,
          grado: oferta.gradoNombre ?? null,
          dia: oferta.dia ?? null,
          horaInicio: oferta.horaInicio ?? null,
          horaFinalizacion: oferta.horaFinalizacion ?? null,
        })),
        detalles: detallesCompletos,
      }
    },
    [],
  )

  const alumnoLabelMap = useMemo(
    () => new Map(alumnoOptionsBase.map((option) => [String(option.value), option.label])),
    [alumnoOptionsBase],
  )

  const recibosDecorados: ReciboListado[] = useMemo(
    () =>
      (recibos ?? []).map((recibo) => {
        const label =
          alumnoLabelMap.get(String(recibo.alumnoId)) ??
          `Alumno ${String(recibo.alumnoId).slice(0, 8).toUpperCase()}`
        return { ...recibo, alumnoLabel: label }
      }),
    [alumnoLabelMap, recibos],
  )

  const alumnoOptions = useMemo(() => {
    const map = new Map<string, SelectOption>()
    recibosDecorados.forEach((recibo) => {
      if (!map.has(String(recibo.alumnoId))) {
        map.set(String(recibo.alumnoId), {
          value: String(recibo.alumnoId),
          label: recibo.alumnoLabel,
        })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [recibosDecorados])

  const filteredAlumnoOptions = useMemo(() => {
    const term = alumnoSearch.trim().toLowerCase()
    if (term.length === 0) return alumnoOptions
    return alumnoOptions.filter((option) => option.label.toLowerCase().includes(term))
  }, [alumnoOptions, alumnoSearch])

  const ofertaOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>()
    recibosDecorados.forEach((recibo) => {
      recibo.ofertas.forEach((oferta) => {
        if (!map.has(oferta.ofertaId)) {
          const horarioPartes = []
          if (oferta.dia) horarioPartes.push(oferta.dia)
          if (oferta.horaInicio && oferta.horaFinalizacion) {
            horarioPartes.push(`${oferta.horaInicio} - ${oferta.horaFinalizacion}`)
          } else if (oferta.horaInicio) {
            horarioPartes.push(oferta.horaInicio)
          } else if (oferta.horaFinalizacion) {
            horarioPartes.push(oferta.horaFinalizacion)
          }

          const horario =
            horarioPartes.length > 0 ? horarioPartes.join(' | ') : 'Horario no disponible'
          const instituto = oferta.institutoNombre ?? 'Instituto no asignado'
          const label = `${oferta.nombreOferta} | ${horario} | ${instituto}`
          map.set(oferta.ofertaId, { value: oferta.ofertaId, label })
        }
      })
    })
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [recibosDecorados])

  const recibosFiltradosPorOferta = useMemo(() => {
    if (!selectedOfertaId) return recibosDecorados
    return recibosDecorados.filter((recibo) =>
      recibo.ofertas.some((oferta) => oferta.ofertaId === selectedOfertaId),
    )
  }, [recibosDecorados, selectedOfertaId])

  const showEstadoColumn = estadoFiltro === ESTADO_TODOS

  const handleSelectAlumno = (option: SelectOption) => {
    setSelectedAlumnoId(String(option.value))
    setAlumnoSearch(option.label ?? '')
    setShowAlumnoDropdown(false)
  }

  const handleClearAlumno = () => {
    setSelectedAlumnoId('')
    setSelectedOfertaId('')
    setEstadoFiltro('EMITIDO')
    setCorrelativoOrden('desc')
    setAlumnoSearch('')
  }

  const handleEdit = useCallback(
    (recibo: ReciboListado) => {
      navigate(`/pagos/recibos/editar/${recibo.reciboId}`, {
        state: { recibo, alumnoLabel: recibo.alumnoLabel },
      })
    },
    [navigate],
  )

  const handlePrint = useCallback(
    async (recibo: ReciboListado) => {
      try {
        const detalle = await loadDetalleRecibo(recibo)
        if (detalle.detalles.length === 0) {
          notify({
            title: 'Recibo sin detalles registrados',
            description:
              'El recibo no tiene montos asociados, se generara el PDF unicamente con la informacion general.',
            variant: 'warning',
          })
        }
        await generarReciboPdf(detalle)
      } catch (error) {
        notify({
          title: 'Error al generar PDF',
          description: getErrorMessage(error, 'No fue posible generar el recibo en PDF.'),
          variant: 'error',
        })
      }
    },
    [loadDetalleRecibo, notify],
  )

  const handleCancel = useCallback(
    async (recibo: ReciboListado) => {
      if (!recibo.reciboId) {
        notify({
          title: 'Recibo sin identificador',
          description: 'No fue posible anular el recibo porque no tiene un ID asociado.',
          variant: 'error',
        })
        return
      }

      if (recibo.estado === 'ANULADO') {
        notify({
          title: 'Recibo ya anulado',
          description: 'El recibo seleccionado ya se encuentra en estado ANULADO.',
          variant: 'info',
        })
        return
      }

      const confirmar = window.confirm('¿Deseas anular este recibo? Esta acción no se puede deshacer.')
      if (!confirmar) return

      try {
        setCancelandoId(String(recibo.reciboId))
        await actualizarRecibo(recibo.reciboId as UUID, { estado: 'ANULADO' })
        notify({
          title: 'Recibo anulado',
          description: 'El recibo se actualizó a estado ANULADO correctamente.',
          variant: 'success',
        })
        setReloadKey((prev) => prev + 1)
      } catch (error) {
        notify({
          title: 'Error al anular',
          description: getErrorMessage(error, 'No fue posible anular el recibo seleccionado.'),
          variant: 'error',
        })
      } finally {
        setCancelandoId(null)
      }
    },
    [notify, setReloadKey],
  )

  const handleView = useCallback(
    async (recibo: ReciboListado) => {
      setDetalleAbierto(true)
      setDetalleError(null)
      setDetalleDatos(null)
      setDetalleCargando(true)

      try {
        const detalle = await loadDetalleRecibo(recibo)
        setDetalleDatos(detalle)
      } catch (error) {
        setDetalleError(
          getErrorMessage(error, 'No fue posible cargar los detalles del recibo seleccionado.'),
        )
      } finally {
        setDetalleCargando(false)
      }
    },
    [loadDetalleRecibo],
  )

  const handleDetallePdf = useCallback(async () => {
    if (!detalleDatos) return

    try {
      await generarReciboPdf(detalleDatos)
    } catch (error) {
      notify({
        title: 'Error al generar PDF',
        description: getErrorMessage(error, 'No fue posible generar el PDF del recibo.'),
        variant: 'error',
      })
    }
  }, [detalleDatos, notify])

  const columns = useMemo(() => {
    const base: TableColumn<ReciboListado>[] = [
      {
        key: 'correlativoRecibo',
        header: 'Correlativo',
        render: (recibo) => recibo.correlativoRecibo ?? '-',
      },
      {
        key: 'fecha',
        header: 'Fecha',
        render: (recibo) => recibo.fecha ?? '-',
      },
      {
        key: 'alumnoLabel',
        header: 'Alumno',
        render: (recibo) => recibo.alumnoLabel,
      },
      {
        key: 'ofertas',
        header: 'Oferta',
        render: (recibo) =>
          recibo.ofertas.length === 0 ? (
            <span>Sin oferta asociada</span>
          ) : (
            <div className="flex flex-col gap-2 text-left">
              {recibo.ofertas.map((oferta) => {
                const horarioPartes = []
                if (oferta.dia) horarioPartes.push(oferta.dia)
                if (oferta.horaInicio && oferta.horaFinalizacion) {
                  horarioPartes.push(`${oferta.horaInicio} - ${oferta.horaFinalizacion}`)
                } else if (oferta.horaInicio) {
                  horarioPartes.push(oferta.horaInicio)
                } else if (oferta.horaFinalizacion) {
                  horarioPartes.push(oferta.horaFinalizacion)
                }
                return (
                  <div
                    key={`${recibo.reciboId}-${oferta.ofertaId}`}
                    className="rounded-xl border border-[#dbe7f7] bg-white/80 p-2 text-xs leading-relaxed text-[#1f3c63] shadow-[0_18px_34px_-30px_rgba(0,51,102,0.38)]"
                  >
                    <div className="text-sm font-semibold text-[#1f3c63]">
                      {oferta.nombreOferta}
                    </div>
                    <div>{horarioPartes.length > 0 ? horarioPartes.join(' | ') : 'Horario no disponible'}</div>
                    <div className="text-[#667085]">
                      {oferta.institutoNombre ?? 'Instituto no asignado'}
                    </div>
                  </div>
                )
              })}
            </div>
          ),
      },
      {
        key: 'total',
        header: 'Monto total',
        render: (recibo) => formatCurrency(recibo.total),
      },
    ]
    if (showEstadoColumn) {
      base.push({
        key: 'estado',
        header: 'Estado',
        render: (recibo) => recibo.estado ?? 'EMITIDO',
      })
    }

    return base
  }, [showEstadoColumn])

  const renderTableActions = useCallback(
    (recibo: ReciboListado) => {
      const baseButtonClass =
        'inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500'
      const cancelDisabled =
        recibo.estado === 'ANULADO' || cancelandoId === String(recibo.reciboId)
      return (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            className={`${baseButtonClass} border-sky-200 bg-sky-100 text-sky-600 hover:bg-sky-200`}
            title="Ver detalles del recibo"
            onClick={() => handleView(recibo)}
            aria-label="Ver detalles del recibo"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={
              cancelDisabled
                ? `${baseButtonClass} cursor-not-allowed opacity-50 border-gray-200 bg-gray-100 text-gray-400`
                : `${baseButtonClass} border-red-200 bg-red-100 text-red-600 hover:bg-red-200`
            }
            title={
              cancelandoId === String(recibo.reciboId)
                ? 'Anulando recibo...'
                : recibo.estado === 'ANULADO'
                  ? 'Este recibo ya fue anulado'
                  : 'Anular recibo'
            }
            onClick={() => handleCancel(recibo)}
            aria-label="Anular recibo"
            disabled={cancelDisabled}
            aria-busy={cancelandoId === String(recibo.reciboId)}
          >
            <Ban className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`${baseButtonClass} border-blue-200 bg-blue-100 text-blue-600 hover:bg-blue-200`}
            title="Editar recibo"
            onClick={() => handleEdit(recibo)}
            aria-label="Editar recibo"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`${baseButtonClass} border-green-200 bg-green-100 text-green-600 hover:bg-green-200`}
            title="Imprimir recibo"
            onClick={() => handlePrint(recibo)}
            aria-label="Imprimir recibo"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      )
    },
    [cancelandoId, handleCancel, handleEdit, handlePrint, handleView],
  )

  const recibosVisibles = useMemo(() => {
    const sorted = [...recibosFiltradosPorOferta]
    sorted.sort((a, b) => {
      const corrA = parseCorrelativo(a.correlativoRecibo)
      const corrB = parseCorrelativo(b.correlativoRecibo)
      if (corrA === null && corrB === null) return 0
      if (corrA === null) return correlativoOrden === 'desc' ? 1 : -1
      if (corrB === null) return correlativoOrden === 'desc' ? -1 : 1
      return correlativoOrden === 'desc' ? corrB - corrA : corrA - corrB
    })
    return sorted
  }, [correlativoOrden, recibosFiltradosPorOferta])

  const totalRecibos = recibosVisibles.length
  const selectedAlumnoLabel = selectedAlumnoId
    ? alumnoLabelMap.get(String(selectedAlumnoId)) ?? null
    : null
  const selectedOfertaLabel = selectedOfertaId
    ? ofertaOptions.find((option) => option.value === selectedOfertaId)?.label ?? null
    : null
  const estadoLabel =
    ESTADO_OPTIONS.find((option) => option.value === estadoFiltro)?.label ?? 'Emitidos'
  const alumnoResumen = selectedAlumnoLabel ? selectedAlumnoLabel.split(' - ')[0] : null
  const ofertaResumen = selectedOfertaLabel ? selectedOfertaLabel.split(' | ')[0] : null
  const filtrosResumenPartes: string[] = []
  if (alumnoResumen) filtrosResumenPartes.push(`Alumno: ${alumnoResumen}`)
  if (ofertaResumen) filtrosResumenPartes.push(`Oferta: ${ofertaResumen}`)
  if (estadoFiltro !== 'EMITIDO') filtrosResumenPartes.push(`Estado: ${estadoLabel}`)
  if (correlativoOrden !== 'desc') filtrosResumenPartes.push('Orden: Mas antiguos')
  const filtrosLabel =
    filtrosResumenPartes.length > 0 ? filtrosResumenPartes.join(' | ') : `Estado: ${estadoLabel}`
  const filtrosAccent: 'white' | 'yellow' | 'orange' =
    estadoFiltro === 'ANULADO'
      ? 'orange'
      : filtrosResumenPartes.length > 0
        ? 'white'
        : 'yellow'
  const resultadosDescripcion =
    totalRecibos === 0
      ? 'No se encontraron recibos que coincidan con los filtros seleccionados.'
      : alumnoResumen
        ? `Se encontraron ${totalRecibos} recibo(s) para ${alumnoResumen}.`
        : estadoFiltro === 'ANULADO'
          ? `Se encontraron ${totalRecibos} recibo(s) anulados.`
          : `Se encontraron ${totalRecibos} recibo(s) emitidos.`

  return (
    <Page
      title="Gestion de recibos"
      description="Consulta, filtra e imprime los recibos emitidos. Los filtros se aplican de forma automatica."
    >
      <HeroSummary
        title="Gestion de recibos"
        total={totalRecibos}
        filtersLabel={filtrosLabel}
        filtersAccent={filtrosAccent}
      />

      <div className="grid gap-6">
        <PanelCard className="px-6 py-6">
          <div className="grid gap-4 md:grid-cols-12 md:items-end">
            <div className="relative md:col-span-6">
              <label className="mb-1 block text-sm font-medium text-[#1f3c63]" htmlFor="alumno-filter">
                Alumno
              </label>
              <input
                id="alumno-filter"
                type="text"
                value={alumnoSearch}
                onChange={(event) => {
                  if (selectedAlumnoId) setSelectedAlumnoId('')
                  setAlumnoSearch(event.target.value)
                  setShowAlumnoDropdown(true)
                }}
                onFocus={() => setShowAlumnoDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowAlumnoDropdown(false), 120)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setShowAlumnoDropdown(false)
                    return
                  }
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    const first = filteredAlumnoOptions[0]
                    if (first) handleSelectAlumno(first)
                  }
                }}
                placeholder="Buscar por nombre, apellido o carnet"
                className="w-full rounded-xl border border-[#dbe7f7] bg-white px-3 py-2 text-sm text-[#1f3c63] shadow-sm transition focus:border-[#3385ff] focus:ring-2 focus:ring-[rgba(51,133,255,0.28)]"
                autoComplete="off"
              />
              {showAlumnoDropdown && filteredAlumnoOptions.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[#dbe7f7] bg-white shadow-[0_24px_44px_-28px_rgba(0,51,102,0.45)]">
                  {filteredAlumnoOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-[rgba(0,102,204,0.08)] ${
                        option.value === selectedAlumnoId ? 'bg-[rgba(0,102,204,0.08)] text-[#0066cc]' : ''
                      }`}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        handleSelectAlumno(option)
                      }}
                    >
                      <span className="truncate">{option.label}</span>
                      {option.value === selectedAlumnoId ? (
                        <span className="text-xs font-semibold uppercase text-[#0066cc]">
                          Seleccionado
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-[#667085]">
                Solo se listan los alumnos que tienen al menos un recibo emitido.
              </p>
            </div>

            <div className="md:col-span-6">
              <NiceSelect
                label="Oferta"
                placeholder={ofertaOptions.length === 0 ? 'Sin ofertas disponibles' : 'Todas las ofertas'}
                value={selectedOfertaId}
                onChange={(val) => setSelectedOfertaId(val)}
                options={[{ label: 'Todas las ofertas', value: '' }, ...ofertaOptions]}
                disabled={ofertaOptions.length === 0}
              />
            </div>

            <div className="md:col-span-3">
              <NiceSelect
                label="Estado"
                placeholder="Todos"
                value={estadoFiltro}
                onChange={(val) => setEstadoFiltro(val as EstadoFiltro)}
                options={ESTADO_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
              />
            </div>

            <div className="md:col-span-3">
              <NiceSelect
                label="Orden correlativo"
                placeholder="Ordenar"
                value={correlativoOrden}
                onChange={(val) => setCorrelativoOrden(val as CorrelativoOrden)}
                options={CORRELATIVO_ORDEN_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleClearAlumno}>
              Limpiar filtros
            </Button>
          </div>
        </PanelCard>

        {loadError && (
          <PanelCard className="border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {loadError}
          </PanelCard>
        )}

        {loadingRecibos ? (
          <PanelCard className="flex justify-center px-6 py-12">
            <Spinner size="lg" />
          </PanelCard>
        ) : (
          <PanelCard className="px-0 py-0">
            <div className="flex flex-col gap-4 border-b border-[#dbe7f7]/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#1f3c63]">Resultados</h3>
                <p className="text-xs text-[#667085]">{resultadosDescripcion}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setReloadKey((prev) => prev + 1)}
                  disabled={loadingRecibos}
                >
                  {loadingRecibos ? 'Actualizando...' : 'Recargar'}
                </Button>
              </div>
            </div>

            <Table<ReciboListado>
              data={recibosVisibles}
              columns={columns}
              renderActions={renderTableActions}
              emptyMessage="No hay recibos que coincidan con los filtros seleccionados."
              getRowKey={(item) =>
                item.reciboId
                  ? String(item.reciboId)
                  : item.correlativoRecibo ?? `${item.alumnoId}-${item.fecha ?? ''}`
              }
              classNameHeader={cls.tableHeader}
              classNameRow={cls.tableRow}
            />
          </PanelCard>
        )}
      </div>

      <Modal
        isOpen={detalleAbierto}
        onClose={() => {
          setDetalleAbierto(false)
          setDetalleDatos(null)
          setDetalleError(null)
          setDetalleCargando(false)
        }}
        title="Detalle del recibo"
        actions={
          detalleDatos ? (
            <Button type="button" onClick={handleDetallePdf} disabled={detalleCargando}>
              Generar PDF
            </Button>
          ) : undefined
        }
      >
        {detalleCargando ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : detalleError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {detalleError}
          </div>
        ) : detalleDatos ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#dbe7f7] bg-[rgba(249,250,251,0.82)] p-4 text-sm text-[#1f3c63] shadow-[0_18px_36px_-28px_rgba(0,51,102,0.45)]">
              <div className="grid gap-2">
                <div>
                  <span className="font-semibold text-[#1f3c63]">Correlativo:</span>{' '}
                  {detalleDatos.correlativo ?? 'Sin asignar'}
                </div>
                <div>
                  <span className="font-semibold text-[#1f3c63]">Alumno:</span>{' '}
                  {detalleDatos.alumnoNombre}
                </div>
                <div>
                  <span className="font-semibold text-[#1f3c63]">Encargado(s):</span>{' '}
                  {detalleDatos.encargados.length > 0
                    ? detalleDatos.encargados.join(', ')
                    : 'Sin encargados registrados'}
                </div>
                <div>
                  <span className="font-semibold text-[#1f3c63]">Fecha de emision:</span>{' '}
                  {detalleDatos.fechaEmision ?? 'Sin fecha'}
                </div>
                <div>
                  <span className="font-semibold text-[#1f3c63]">Estado:</span>{' '}
                  {detalleDatos.estado ?? 'EMITIDO'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1f3c63]">informacion de la oferta</h3>
              {detalleDatos.ofertas.length === 0 ? (
                <p className="mt-2 text-sm text-[#667085]">
                  No hay ofertas asociadas a este recibo.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {detalleDatos.ofertas.map((oferta) => {
                    const horarioPartes: string[] = []
                    if (oferta.dia) horarioPartes.push(oferta.dia)
                    if (oferta.horaInicio && oferta.horaFinalizacion) {
                      horarioPartes.push(`${oferta.horaInicio} - ${oferta.horaFinalizacion}`)
                    } else if (oferta.horaInicio) {
                      horarioPartes.push(oferta.horaInicio)
                    } else if (oferta.horaFinalizacion) {
                      horarioPartes.push(oferta.horaFinalizacion)
                    }
                    return (
                      <div
                        key={`${oferta.ofertaId}-${oferta.nombre}`}
                        className="rounded-xl border border-[#dbe7f7] bg-white/90 p-3 text-sm text-[#1f3c63] shadow-[0_20px_38px_-32px_rgba(0,51,102,0.35)]"
                      >
                        <div className="text-base font-semibold text-[#1f3c63]">{oferta.nombre}</div>
                        <div className="mt-1">
                          <span className="font-semibold text-[#1f3c63]">Instituto:</span>{' '}
                          {oferta.instituto ?? 'No asignado'}
                        </div>
                        <div>
                          <span className="font-semibold text-[#1f3c63]">Grado:</span>{' '}
                          {oferta.grado ?? 'No indicado'}
                        </div>
                        <div>
                          <span className="font-semibold text-[#1f3c63]">Horario:</span>{' '}
                          {horarioPartes.length > 0
                            ? horarioPartes.join(' | ')
                            : 'Horario no disponible'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1f3c63]">Detalles del recibo</h3>
              {detalleDatos.detalles.length === 0 ? (
                <p className="mt-2 text-sm text-[#667085]">
                  No hay detalles registrados para este recibo.
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#dbe7f7] text-left text-sm text-[#1f3c63]">
                    <thead className="bg-[rgba(0,102,204,0.06)]">
                      <tr className="text-[#1f3c63]">
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">Mes pagado</th>
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">Concepto</th>
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">Monto original</th>
                        <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">Monto aplicado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef3fb]">
                      {detalleDatos.detalles.map((detalle) => (
                        <tr key={detalle.cargoId} className="text-[#1f3c63]">
                          <td className="px-3 py-2">
                            {detalle.periodoMes ?? 'Sin periodo'}
                          </td>
                          <td className="px-3 py-2">
                            {detalle.concepto ?? 'Sin concepto'}
                          </td>
                          <td className="px-3 py-2">
                            {formatCurrency(detalle.montoOriginal)}
                          </td>
                          <td className="px-3 py-2">
                            {formatCurrency(detalle.montoAplicado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 grid gap-2 text-sm text-[#1f3c63]">
                <div>
                  <span className="font-semibold text-[#1f3c63]">Monto original de la tarifa:</span>{' '}
                  {formatCurrency(detalleDatos.montoBase)}
                </div>
                <div>
                  <span className="font-semibold text-[#1f3c63]">Numero de pagos:</span>{' '}
                  {formatPaymentCount(detalleDatos.numeroPagos)}
                </div>
                <div>
                  <span className="font-semibold text-[#1f3c63]">Total del recibo:</span>{' '}
                  {formatCurrency(detalleDatos.total)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#667085]">Selecciona un recibo para ver sus detalles.</p>
        )}
      </Modal>
    </Page>
  )
}

export default RecibosList



