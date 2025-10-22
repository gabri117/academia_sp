import { format, isAfter, isBefore, isEqual, isValid, parseISO, startOfMonth, subDays, subMonths } from 'date-fns'

import type { Page } from '../contract/pagination'
import type { Alumno } from '../contract/moduleA'
import type { Inscripcion, OfertaCurso } from '../contract/moduleB'
import type {
  Calificacion,
  ReciboConOfertasDTO,
  TarifaCurso,
} from '../contract/moduleC'
import { listAlumnos } from './alumnos'
import { listEstablecimientos } from './establecimientos'
import { listInscripciones } from './inscripciones'
import { listarRecibosConOfertas } from './recibos'
import { listarTarifas } from './tarifas'
import { listGrados } from './grados'
import { listOfertasCurso } from './ofertas'
import { listarCursosParaDiccionario } from './cursosCatalogo'
import { listarCalificacionesPorOferta } from './calificaciones'

type Fetcher<T> = (page: number, size: number) => Promise<Page<T>>

const DEFAULT_PAGE_SIZE = 200

const fetchAllPages = async <T>(fetcher: Fetcher<T>, size = DEFAULT_PAGE_SIZE): Promise<T[]> => {
  let page = 0
  let totalPages = 1
  const collected: T[] = []

  while (page < totalPages) {
    const response = await fetcher(page, size)
    collected.push(...response.content)
    totalPages = response.totalPages || totalPages
    if (totalPages === 0) break
    page += 1
  }

  return collected
}

const safeParseDate = (value?: string | null): Date | null => {
  if (!value) return null
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : null
}

const withinRange = (date: Date, desde?: Date | null, hasta?: Date | null) => {
  if (desde && isBefore(date, desde)) return false
  if (hasta && isAfter(date, hasta)) return false
  return true
}

const normalizarNombre = (primary?: string | null, fallback?: string | null) => {
  if (primary && primary.trim().length > 0) return primary.trim()
  if (fallback && fallback.trim().length > 0) return fallback.trim()
  return 'Sin nombre'
}

const lower = (value: string) => value.toLowerCase()

export type ResumenInstituto = {
  institutoId: string
  nombre: string
  totalAlumnos: number
  activos: number
  inactivos: number
  nuevosUltimoMes: number
  grados: { gradoId: string; gradoNombre: string; total: number }[]
}

export const obtenerResumenInstitutos = async (): Promise<ResumenInstituto[]> => {
  const [establecimientosPage, alumnos, inscripciones, ofertas, gradosPage] = await Promise.all([
    fetchAllPages((page, size) => listEstablecimientos({ page, size, sort: 'nombre,asc' })),
    fetchAllPages((page, size) => listAlumnos({ page, size, sort: 'nombre,asc' })),
    fetchAllPages((page, size) => listInscripciones({ page, size, sort: 'fechaInscripcion,desc' })),
    fetchAllPages((page, size) => listOfertasCurso({ page, size, sort: 'fechaInicio,desc' })),
    fetchAllPages((page, size) => listGrados({ page, size })),
  ])

  const institutos = new Map<string, ResumenInstituto>()

  establecimientosPage.forEach((item) => {
    institutos.set(String(item.institutoId), {
      institutoId: String(item.institutoId),
      nombre: item.nombre ?? 'Instituto',
      totalAlumnos: 0,
      activos: 0,
      inactivos: 0,
      nuevosUltimoMes: 0,
      grados: [],
    })
  })

  alumnos.forEach((alumno) => {
    const institutoId = String(alumno.institutoId ?? '')
    if (!institutos.has(institutoId)) {
      institutos.set(institutoId, {
        institutoId,
        nombre: 'Instituto sin registro',
        totalAlumnos: 0,
        activos: 0,
        inactivos: 0,
        nuevosUltimoMes: 0,
        grados: [],
      })
    }
    const resumen = institutos.get(institutoId)!
    resumen.totalAlumnos += 1
    if (lower(alumno.estado ?? '') === 'activo') {
      resumen.activos += 1
    } else {
      resumen.inactivos += 1
    }
  })

  const ofertaMap = new Map<string, OfertaCurso>()
  ofertas.forEach((oferta) => {
    ofertaMap.set(String(oferta.id), oferta)
    if (!institutos.has(String(oferta.institutoId))) {
      institutos.set(String(oferta.institutoId), {
        institutoId: String(oferta.institutoId),
        nombre: 'Instituto sin registro',
        totalAlumnos: 0,
        activos: 0,
        inactivos: 0,
        nuevosUltimoMes: 0,
        grados: [],
      })
    }
  })

  const gradoNombreMap = new Map<string, string>()
  gradosPage.forEach((grado) => {
    gradoNombreMap.set(String(grado.gradoId), grado.nombre ?? 'Grado')
  })

  const threshold = subDays(new Date(), 30)
  const nuevosPorInstituto = new Map<string, Set<string>>()
  const gradosPorInstituto = new Map<string, Map<string, Set<string>>>()

  inscripciones.forEach((inscripcion) => {
    const oferta = ofertaMap.get(String(inscripcion.ofertaId))
    if (!oferta) return
    const institutoId = String(oferta.institutoId)
    const alumnoId = String(inscripcion.alumnoId)

    const fecha = safeParseDate(inscripcion.fechaInscripcion)
    if (fecha && !isBefore(fecha, threshold)) {
      if (!nuevosPorInstituto.has(institutoId)) {
        nuevosPorInstituto.set(institutoId, new Set())
      }
      nuevosPorInstituto.get(institutoId)!.add(alumnoId)
    }

    if (!gradosPorInstituto.has(institutoId)) {
      gradosPorInstituto.set(institutoId, new Map())
    }

    const gradoId = String(oferta.gradoId ?? '')
    if (!gradosPorInstituto.get(institutoId)!.has(gradoId)) {
      gradosPorInstituto.get(institutoId)!.set(gradoId, new Set())
    }

    gradosPorInstituto.get(institutoId)!.get(gradoId)!.add(alumnoId)
  })

  institutos.forEach((resumen, institutoId) => {
    const nuevos = nuevosPorInstituto.get(institutoId)
    resumen.nuevosUltimoMes = nuevos ? nuevos.size : 0
    const mapaGrados = gradosPorInstituto.get(institutoId)
    if (mapaGrados) {
      resumen.grados = Array.from(mapaGrados.entries()).map(([gradoId, alumnosSet]) => ({
        gradoId,
        gradoNombre: gradoNombreMap.get(gradoId) ?? 'Grado',
        total: alumnosSet.size,
      }))
    }
  })

  return Array.from(institutos.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export type PanoramaInscripcionesFiltro = {
  fechaDesde?: string
  fechaHasta?: string
}

export type PanoramaInscripciones = {
  resumen: {
    totalInscripciones: number
    totalAlumnos: number
    nuevas: number
    canceladas: number
  }
  porGrado: { label: string; valor: number }[]
  porOferta: { label: string; valor: number }[]
}

const ESTADOS_CANCELADOS = ['cancelado', 'cancelada', 'anulado', 'anulada']

export const obtenerPanoramaInscripciones = async (
  filtros: PanoramaInscripcionesFiltro,
): Promise<PanoramaInscripciones> => {
  const [inscripciones, ofertas, grados, cursosDiccionario, alumnos] = await Promise.all([
    fetchAllPages((page, size) => listInscripciones({ page, size, sort: 'fechaInscripcion,desc' })),
    fetchAllPages((page, size) => listOfertasCurso({ page, size, sort: 'fechaInicio,desc' })),
    fetchAllPages((page, size) => listGrados({ page, size })),
    listarCursosParaDiccionario({ size: 500 }),
    fetchAllPages((page, size) => listAlumnos({ page, size, sort: 'nombre,asc' })),
  ])

  const ofertaMap = new Map<string, OfertaCurso>()
  ofertas.forEach((oferta) => {
    ofertaMap.set(String(oferta.id), oferta)
  })

  const gradoNombreMap = new Map<string, string>()
  grados.forEach((grado) => {
    gradoNombreMap.set(String(grado.gradoId), grado.nombre ?? 'Grado')
  })

  const alumnoPorId = new Map<string, Alumno>()
  alumnos.forEach((alumno) => {
    alumnoPorId.set(String(alumno.id), alumno)
  })

  const desde = safeParseDate(filtros.fechaDesde)
  const hasta = safeParseDate(filtros.fechaHasta)

  const porGrado = new Map<string, Set<string>>()
  const porOferta = new Map<string, number>()
  const nuevos = new Set<string>()
  const canceladas = new Set<string>()
  const alumnosUnicos = new Set<string>()

  inscripciones.forEach((inscripcion) => {
    const fecha = safeParseDate(inscripcion.fechaInscripcion)
    if (fecha && !withinRange(fecha, desde, hasta)) return

    const oferta = ofertaMap.get(String(inscripcion.ofertaId))
    if (!oferta) return

    const gradoId = String(oferta.gradoId ?? '')
    if (!porGrado.has(gradoId)) {
      porGrado.set(gradoId, new Set())
    }
    porGrado.get(gradoId)!.add(String(inscripcion.alumnoId))

    const ofertaNombre = normalizarNombre(
      cursosDiccionario.get(String(oferta.cursoId)),
      `Oferta ${String(oferta.id).slice(0, 8)}`,
    )
    porOferta.set(ofertaNombre, (porOferta.get(ofertaNombre) ?? 0) + 1)

    alumnosUnicos.add(String(inscripcion.alumnoId))

    if (fecha && desde && !isBefore(fecha, desde)) {
      nuevos.add(String(inscripcion.id ?? `${inscripcion.alumnoId}-${inscripcion.ofertaId}`))
    }

    const estado = lower(inscripcion.estado ?? '')
    if (ESTADOS_CANCELADOS.some((value) => estado.includes(value))) {
      canceladas.add(String(inscripcion.id ?? `${inscripcion.alumnoId}-${inscripcion.ofertaId}`))
    }
  })

  return {
    resumen: {
      totalInscripciones: inscripciones.filter((inscripcion) => {
        const fecha = safeParseDate(inscripcion.fechaInscripcion)
        if (!fecha) return !desde && !hasta
        return withinRange(fecha, desde, hasta)
      }).length,
      totalAlumnos: alumnosUnicos.size,
      nuevas: nuevos.size,
      canceladas: canceladas.size,
    },
    porGrado: Array.from(porGrado.entries()).map(([gradoId, alumnosSet]) => ({
      label: gradoNombreMap.get(gradoId) ?? 'Grado',
      valor: alumnosSet.size,
    })),
    porOferta: Array.from(porOferta.entries()).map(([label, valor]) => ({
      label,
      valor,
    })),
  }
}

export type EstadoCobranzaItem = {
  alumnoId: string
  alumnoNombre: string
  ofertaId: string
  ofertaNombre: string
  estado: 'al-dia' | 'pendiente'
  fechaUltimoRecibo?: string | null
}

export type TarifaOfertaResumen = {
  ofertaId: string
  ofertaNombre: string
  montoInscripcion: number
  montoMensualidad: number
  inscritos: number
  totalGenerado: number
  totalPagado: number
}

export type ResumenFinanzas = {
  resumen: {
    totalGenerado: number
    totalPagado: number
    totalPendiente: number
    alumnosAlDia: number
    alumnosPendientes: number
  }
  detalleTarifas: TarifaOfertaResumen[]
  estadoCobranza: EstadoCobranzaItem[]
}

const formatearNombreAlumno = (alumno: Alumno | undefined) => {
  if (!alumno) return 'Alumno'
  return `${alumno.nombre ?? ''} ${alumno.apellido ?? ''}`.trim() || 'Alumno'
}

const formatearNombreOferta = (
  oferta: OfertaCurso | undefined,
  cursosDiccionario: Map<string, string>,
) => {
  if (!oferta) return 'Oferta'
  const cursoNombre = cursosDiccionario.get(String(oferta.cursoId))
  const dia = oferta.dia ?? ''
  const horario = oferta.horaInicio && oferta.horaFinalizacion
    ? `${oferta.horaInicio}-${oferta.horaFinalizacion}`
    : ''
  return [cursoNombre ?? 'Oferta', dia, horario].filter(Boolean).join(' | ') || 'Oferta'
}

export const obtenerResumenFinanzas = async (): Promise<ResumenFinanzas> => {
  const inicioMes = startOfMonth(new Date())
  const finMes = new Date()
  const [inscripciones, ofertas, alumnos, cursosDiccionario] = await Promise.all([
    fetchAllPages((page, size) => listInscripciones({ page, size, sort: 'fechaInscripcion,desc' })),
    fetchAllPages((page, size) => listOfertasCurso({ page, size, sort: 'fechaInicio,desc' })),
    fetchAllPages((page, size) => listAlumnos({ page, size, sort: 'nombre,asc' })),
    listarCursosParaDiccionario({ size: 500 }),
  ])

  let recibos: ReciboConOfertasDTO[] = []
  try {
    recibos = await listarRecibosConOfertas()
  } catch (error) {
    console.warn('No fue posible obtener el listado de recibos con ofertas:', error)
  }

  const ofertaMap = new Map<string, OfertaCurso>()
  ofertas.forEach((oferta) => {
    ofertaMap.set(String(oferta.id), oferta)
  })

  const alumnoMap = new Map<string, Alumno>()
  alumnos.forEach((alumno) => {
    alumnoMap.set(String(alumno.id), alumno)
  })

  const tarifaMap = new Map<string, TarifaCurso>()
  try {
    const tarifas = await listarTarifas()
    tarifas.forEach((tarifa) => {
      tarifaMap.set(String(tarifa.ofertaId), tarifa)
    })
  } catch {
    // si no se puede obtener listado completo se mantiene el mapa vacio
  }

  const recibosPorAlumno = new Map<string, ReciboConOfertasDTO[]>()
  recibos.forEach((recibo) => {
    const alumnoId = String(recibo.alumnoId)
    if (!recibosPorAlumno.has(alumnoId)) {
      recibosPorAlumno.set(alumnoId, [])
    }
    recibosPorAlumno.get(alumnoId)!.push(recibo)
  })

  const detalleTarifas = new Map<string, TarifaOfertaResumen>()
  const estadoCobranza: EstadoCobranzaItem[] = []

  let totalGenerado = 0
  let totalPagado = 0

  const alumnosAlDiaSet = new Set<string>()
  const alumnosPendientesSet = new Set<string>()

  inscripciones.forEach((inscripcion) => {
    const ofertaId = String(inscripcion.ofertaId)
    const alumnoId = String(inscripcion.alumnoId)

    const oferta = ofertaMap.get(ofertaId)
    if (!oferta) return

    const tarifa = tarifaMap.get(ofertaId)
    const montoMensualidad = tarifa?.montoMensualidad ?? 0

    totalGenerado += montoMensualidad

    const recibosAlumno = recibosPorAlumno.get(alumnoId) ?? []
    const reciboDelMes = recibosAlumno.find((recibo) => {
      const fecha = safeParseDate(recibo.fecha ?? null)
      if (!fecha) return false
      return (
        (isEqual(fecha, inicioMes) || isAfter(fecha, inicioMes)) &&
        (isEqual(fecha, finMes) || isBefore(fecha, finMes))
      )
    })

    if (reciboDelMes && typeof reciboDelMes.total === 'number') {
      totalPagado += reciboDelMes.total
    }

    const alumnoNombre = formatearNombreAlumno(alumnoMap.get(alumnoId))
    const ofertaNombre = formatearNombreOferta(oferta, cursosDiccionario)
    const estado = reciboDelMes ? 'al-dia' : 'pendiente'

    if (estado === 'al-dia') {
      alumnosAlDiaSet.add(alumnoId)
    } else {
      alumnosPendientesSet.add(alumnoId)
    }

    estadoCobranza.push({
      alumnoId,
      alumnoNombre,
      ofertaId,
      ofertaNombre,
      estado,
      fechaUltimoRecibo: reciboDelMes?.fecha ?? null,
    })

    if (!detalleTarifas.has(ofertaId)) {
      detalleTarifas.set(ofertaId, {
        ofertaId,
        ofertaNombre,
        montoInscripcion: tarifa?.montoInscripcion ?? 0,
        montoMensualidad,
        inscritos: 0,
        totalGenerado: 0,
        totalPagado: 0,
      })
    }

    const resumen = detalleTarifas.get(ofertaId)!
    resumen.inscritos += 1
    resumen.totalGenerado += montoMensualidad
    if (reciboDelMes && typeof reciboDelMes.total === 'number') {
      resumen.totalPagado += reciboDelMes.total
    }
  })

  const totalPendiente = Math.max(totalGenerado - totalPagado, 0)

  return {
    resumen: {
      totalGenerado,
      totalPagado,
      totalPendiente,
      alumnosAlDia: alumnosAlDiaSet.size,
      alumnosPendientes: alumnosPendientesSet.size,
    },
    detalleTarifas: Array.from(detalleTarifas.values()).sort((a, b) =>
      a.ofertaNombre.localeCompare(b.ofertaNombre),
    ),
    estadoCobranza: estadoCobranza.sort((a, b) => a.alumnoNombre.localeCompare(b.alumnoNombre)),
  }
}

export type OfertaCupoResumen = {
  ofertaId: string
  ofertaNombre: string
  capacidad: number
  inscritos: number
  ocupacion: number
  diasParaLlenar?: number | null
}

export const obtenerOfertasYCupos = async (): Promise<OfertaCupoResumen[]> => {
  const [ofertas, inscripciones, cursosDiccionario] = await Promise.all([
    fetchAllPages((page, size) => listOfertasCurso({ page, size, sort: 'fechaInicio,desc' })),
    fetchAllPages((page, size) => listInscripciones({ page, size, sort: 'fechaInscripcion,desc' })),
    listarCursosParaDiccionario({ size: 500 }),
  ])

  const inscripcionesPorOferta = new Map<string, Inscripcion[]>()
  inscripciones.forEach((inscripcion) => {
    const ofertaId = String(inscripcion.ofertaId)
    if (!inscripcionesPorOferta.has(ofertaId)) {
      inscripcionesPorOferta.set(ofertaId, [])
    }
    inscripcionesPorOferta.get(ofertaId)!.push(inscripcion)
  })

  const ahora = new Date()
  const haceTresMeses = subMonths(ahora, 3)

  return ofertas.map((oferta) => {
    const ofertaId = String(oferta.id)
    const inscritos = inscripcionesPorOferta.get(ofertaId) ?? []
    const capacidad = oferta.capacidad ?? 0
    const ocupacion = capacidad > 0 ? Math.min((inscritos.length / capacidad) * 100, 100) : 0

    const recientes = inscritos
      .map((inscripcion) => safeParseDate(inscripcion.fechaInscripcion))
      .filter((fecha): fecha is Date => Boolean(fecha) && !isBefore(fecha!, haceTresMeses))

    let diasParaLlenar: number | null = null
    if (capacidad > inscritos.length) {
      const restantes = capacidad - inscritos.length
      if (recientes.length > 0) {
        const diasTotales = recientes.reduce((acc, fecha) => {
          const fechaInicio = safeParseDate(oferta.fechaInicio) ?? haceTresMeses
          return acc + Math.max(1, Math.abs((fecha.getTime() - fechaInicio.getTime()) / 86400000))
        }, 0)
        const ritmo = recientes.length > 0 ? diasTotales / recientes.length : null
        diasParaLlenar = ritmo ? Math.round(ritmo * restantes) : null
      }
    }

    return {
      ofertaId,
      ofertaNombre: formatearNombreOferta(oferta, cursosDiccionario),
      capacidad,
      inscritos: inscritos.length,
      ocupacion: Number.isFinite(ocupacion) ? Number(ocupacion.toFixed(1)) : 0,
      diasParaLlenar,
    }
  })
}

export type TendenciaSerie = { periodo: string; valor: number }

export type TendenciasGenerales = {
  matriculasMensuales: TendenciaSerie[]
  ingresosMensuales: TendenciaSerie[]
  promedioCalificaciones: number | null
  calificacionMinima: number | null
  calificacionMaxima: number | null
}

const agruparPorMes = (fechas: Date[]) => {
  const mapa = new Map<string, number>()
  fechas.forEach((fecha) => {
    const clave = format(fecha, 'yyyy-MM')
    mapa.set(clave, (mapa.get(clave) ?? 0) + 1)
  })
  return Array.from(mapa.entries())
    .map(([periodo, cantidad]) => ({ periodo, valor: cantidad }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo))
}

export const obtenerTendenciasGenerales = async (): Promise<TendenciasGenerales> => {
  const [inscripciones, recibos, ofertas] = await Promise.all([
    fetchAllPages((page, size) => listInscripciones({ page, size, sort: 'fechaInscripcion,desc' })),
    listarRecibosConOfertas({}),
    fetchAllPages((page, size) => listOfertasCurso({ page, size, sort: 'fechaInicio,desc' })),
  ])

  const fechasInscripciones = inscripciones
    .map((inscripcion) => safeParseDate(inscripcion.fechaInscripcion))
    .filter((fecha): fecha is Date => Boolean(fecha))

  const montosRecibosPorMes = new Map<string, number>()
  recibos.forEach((recibo) => {
    const fecha = safeParseDate(recibo.fecha ?? null)
    if (!fecha) return
    const clave = format(fecha, 'yyyy-MM')
    const total = typeof recibo.total === 'number' ? recibo.total : 0
    montosRecibosPorMes.set(clave, (montosRecibosPorMes.get(clave) ?? 0) + total)
  })

  const calificaciones: Calificacion[] = []
  for (const oferta of ofertas.slice(0, 15)) {
    try {
      const lista = await listarCalificacionesPorOferta(String(oferta.id))
      calificaciones.push(...lista)
    } catch {
      // omit errors for ofertas sin calificaciones
    }
  }

  let promedio: number | null = null
  let minima: number | null = null
  let maxima: number | null = null

  if (calificaciones.length > 0) {
    const sumatoria = calificaciones.reduce((acc, item) => acc + (item.nota ?? 0), 0)
    promedio = Number((sumatoria / calificaciones.length).toFixed(2))
    minima = calificaciones.reduce(
      (acc, item) => (acc === null ? item.nota : Math.min(acc, item.nota)),
      null as number | null,
    )
    maxima = calificaciones.reduce(
      (acc, item) => (acc === null ? item.nota : Math.max(acc, item.nota)),
      null as number | null,
    )
    if (minima !== null) minima = Number(minima.toFixed(2))
    if (maxima !== null) maxima = Number(maxima.toFixed(2))
  }

  return {
    matriculasMensuales: agruparPorMes(fechasInscripciones),
    ingresosMensuales: Array.from(montosRecibosPorMes.entries())
      .map(([periodo, valor]) => ({
        periodo,
        valor: Number(valor.toFixed(2)),
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo)),
    promedioCalificaciones: promedio,
    calificacionMinima: minima,
    calificacionMaxima: maxima,
  }
}
