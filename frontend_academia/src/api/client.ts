import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
//ArchovoModificado
import { toPageParams } from '../contract/pagination'
import type { Page, PageableQuery } from '../contract/pagination'
import type {
  Alumno,
  AlumnoCreateDTO,
  AlumnoEncargado,
  AlumnoUpdateDTO,
  Encargado,
  EncargadoCreateUpdateDTO,
  Establecimiento,
  EstablecimientoCreateUpdateDTO,
  Grado,
  GradoCreateUpdateDTO,
  Nivel,
  NivelCreateUpdateDTO,
  UUID,
  VinculoAlumnoEncargadoRequest,
} from '../contract/moduleA'
import type {
  CursoCatalogo,
  CursoCatalogoCreateDTO,
  CursoCatalogoUpdateDTO,
  Inscripcion,
  InscripcionCreateDTO,
  InscripcionUpdateDTO,
  OfertaCurso,
  OfertaCursoCreateDTO,
  OfertaCursoUpdateDTO,
} from '../contract/moduleB'
import { ApiError, normalizeApiError } from './types'
import type {
  Asistencia,
  AsistenciaCreateDTO,
  Calificacion,
  CalificacionCreateDTO,
  Cargo,
  CargoCreateDTO,
  CargoUpdateDTO,
  DetalleRecibo,
  DetalleReciboCreateDTO,
  EstadoCuenta,
  ReciboConOfertasDTO,
  Recibo,
  ReciboEstado,
  ReciboCreateDTO,
  ReciboUpdateDTO,
  SesionClase,
  SesionClaseCreateDTO,
  SesionClaseRangeQuery,
  TarifaCurso,
  TarifaCursoCreateDTO,
  TarifaCursoUpdateDTO,
  UnidadEvaluacion,
  UnidadEvaluacionCreateDTO,
} from '../contract/moduleC'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

const handleError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error

  if (error instanceof AxiosError) {
    return normalizeApiError(error, {
      status: error.response?.status,
      message: error.message,
      error: error.code ?? 'AxiosError',
      path: error.config?.url,
    })
  }

  return normalizeApiError(error)
}

const resolve = async <T>(promise: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    const response = await promise
    return response.data
  } catch (error: unknown) {
    throw handleError(error)
  }
}

export const httpClient = {
  get:  <T>(url: string, config?: AxiosRequestConfig) => resolve<T>(axiosInstance.get<T>(url, config)),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => resolve<T>(axiosInstance.post<T>(url, data, config)),
  put:  <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => resolve<T>(axiosInstance.put<T>(url, data, config)),
  delete:<T>(url: string, config?: AxiosRequestConfig) => resolve<T>(axiosInstance.delete<T>(url, config)),
}

const withPagination = (
  query?: PageableQuery,
  extraParams?: Record<string, string | number | string[] | undefined>,
): AxiosRequestConfig | undefined => {
  if (!query) {
    if (!extraParams) return undefined
    const sanitizedExtras = Object.fromEntries(
      Object.entries(extraParams).filter(([, v]) => v !== undefined && v !== null),
    )
    return Object.keys(sanitizedExtras).length > 0 ? { params: sanitizedExtras } : undefined
  }

  const params = toPageParams(query)
  const mergedEntries = [
    ...Object.entries(params),
    ...(extraParams ? Object.entries(extraParams) : []),
  ].filter(([, v]) => v !== undefined && v !== null)

  if (mergedEntries.length === 0) return undefined

  return { params: Object.fromEntries(mergedEntries) }
}

const withQueryParams = (
  params?: Record<string, string | number | boolean | null | undefined>,
): AxiosRequestConfig | undefined => {
  if (!params) return undefined

  const defined = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (defined.length === 0) return undefined

  return { params: Object.fromEntries(defined) }
}

/* ===========================
 *        MÓDULO A
 * =========================== */

// Alumnos
export const listAlumnos = (query?: PageableQuery) =>
  httpClient.get<Page<Alumno>>('/alumnos', withPagination(query))
export const getAlumno = (id: UUID) => httpClient.get<Alumno>(`/alumnos/${id}`)
export const createAlumno = (payload: AlumnoCreateDTO) => httpClient.post<Alumno>('/alumnos', payload)
export const updateAlumno = (id: UUID, payload: AlumnoUpdateDTO) => httpClient.put<Alumno>(`/alumnos/${id}`, payload)
export const deleteAlumno = (id: UUID) => httpClient.delete<void>(`/alumnos/${id}`)

// Encargados
export const listEncargados = (query?: PageableQuery) =>
  httpClient.get<Page<Encargado>>('/encargados', withPagination(query))
export const getEncargado = (id: UUID) => httpClient.get<Encargado>(`/encargados/${id}`)
export const createEncargado = (payload: EncargadoCreateUpdateDTO) => httpClient.post<Encargado>('/encargados', payload)
export const updateEncargado = (id: UUID, payload: EncargadoCreateUpdateDTO) =>
  httpClient.put<Encargado>(`/encargados/${id}`, payload)
export const deleteEncargado = (id: UUID) => httpClient.delete<void>(`/encargados/${id}`)

// Vínculo Alumno–Encargado
export const vincularAlumnoEncargado = (payload: VinculoAlumnoEncargadoRequest) =>
  httpClient.post<AlumnoEncargado>('/alumno-encargado', payload)
export const desvincularAlumnoEncargado = (alumnoId: UUID, encargadoId: UUID) =>
  httpClient.delete<void>(`/alumno-encargado/${alumnoId}/${encargadoId}`)
export const listarEncargadosPorAlumno = (alumnoId: UUID) =>
  httpClient.get<AlumnoEncargado[]>(`/alumno-encargado/alumno/${alumnoId}`)
export const listarAlumnosPorEncargado = (encargadoId: UUID) =>
  httpClient.get<AlumnoEncargado[]>(`/alumno-encargado/encargado/${encargadoId}`)

// Establecimientos
export const listEstablecimientos = (query?: PageableQuery) =>
  httpClient.get<Page<Establecimiento>>('/establecimientos', withPagination(query))
export const getEstablecimiento = (institutoId: UUID) =>
  httpClient.get<Establecimiento>(`/establecimientos/${institutoId}`)
export const createEstablecimiento = (payload: EstablecimientoCreateUpdateDTO) =>
  httpClient.post<Establecimiento>('/establecimientos', payload)
export const updateEstablecimiento = (institutoId: UUID, payload: EstablecimientoCreateUpdateDTO) =>
  httpClient.put<Establecimiento>(`/establecimientos/${institutoId}`, payload)
export const deleteEstablecimiento = (institutoId: UUID) =>
  httpClient.delete<void>(`/establecimientos/${institutoId}`)

// Niveles
export const listNiveles = () => httpClient.get<Nivel[]>('/niveles-academicos')
export const getNivel = (nivelId: UUID) => httpClient.get<Nivel>(`/niveles-academicos/${nivelId}`)
export const createNivel = (payload: NivelCreateUpdateDTO) => httpClient.post<Nivel>('/niveles-academicos', payload)
export const updateNivel = (nivelId: UUID, payload: NivelCreateUpdateDTO) =>
  httpClient.put<Nivel>(`/niveles-academicos/${nivelId}`, payload)
export const deleteNivel = (nivelId: UUID) => httpClient.delete<void>(`/niveles-academicos/${nivelId}`)

// Grados
export const listGrados = () => httpClient.get<Grado[]>('/grados-academicos')
export const listGradosPorNivel = (nivelId: UUID) => httpClient.get<Grado[]>(`/grados-academicos/nivel/${nivelId}`)
export const getGrado = (gradoId: UUID) => httpClient.get<Grado>(`/grados-academicos/${gradoId}`)
export const createGrado = (payload: GradoCreateUpdateDTO) => httpClient.post<Grado>('/grados-academicos', payload)
export const updateGrado = (gradoId: UUID, payload: GradoCreateUpdateDTO) =>
  httpClient.put<Grado>(`/grados-academicos/${gradoId}`, payload)
export const deleteGrado = (gradoId: UUID) => httpClient.delete<void>(`/grados-academicos/${gradoId}`)

/* ===========================
 *        MÓDULO C
 * =========================== */

// Sesiones de clase
export const createSesionClase = (payload: SesionClaseCreateDTO) =>
  httpClient.post<SesionClase>('/sesiones-clase', payload)

export const listSesionesPorOferta = (ofertaId: UUID) =>
  httpClient.get<SesionClase[]>(`/sesiones-clase/oferta/${ofertaId}`)

export const listSesionesPorRango = (ofertaId: UUID, range?: SesionClaseRangeQuery) =>
  httpClient.get<SesionClase[]>(
    `/sesiones-clase/oferta/${ofertaId}/rango`,
    withQueryParams(range as Record<string, string | number | boolean | undefined>),
  )

// Asistencias
export const registrarAsistencia = (payload: AsistenciaCreateDTO) =>
  httpClient.post<Asistencia>('/asistencias', payload)
export const listAsistenciasPorSesion = (sessionId: UUID) =>
  httpClient.get<Asistencia[]>(`/asistencias/sesion/${sessionId}`)
export const listAsistenciasPorInscripcion = (inscripcionId: UUID) =>
  httpClient.get<Asistencia[]>(`/asistencias/inscripcion/${inscripcionId}`)

// Unidades de evaluación
export const crearUnidadEvaluacion = (payload: UnidadEvaluacionCreateDTO) =>
  httpClient.post<UnidadEvaluacion>('/unidades-evaluacion', payload)
export const listarUnidadesPorOferta = (ofertaId: UUID) =>
  httpClient.get<UnidadEvaluacion[]>(`/unidades-evaluacion/oferta/${ofertaId}`)

// Calificaciones
export const registrarCalificacion = (payload: CalificacionCreateDTO) =>
  httpClient.post<Calificacion>('/calificaciones', payload)
export const listarCalificacionesPorInscripcion = (inscripcionId: UUID) =>
  httpClient.get<Calificacion[]>(`/calificaciones/inscripcion/${inscripcionId}`)
export const listarCalificacionesPorOferta = (ofertaId: UUID) =>
  httpClient.get<Calificacion[]>(`/calificaciones/oferta/${ofertaId}`)

// Tarifas de curso
export const crearTarifaCurso = (payload: TarifaCursoCreateDTO) =>
  httpClient.post<TarifaCurso>('/tarifas-curso', payload)
export const actualizarTarifaCurso = (tarifaId: UUID, payload: TarifaCursoUpdateDTO) =>
  httpClient.put<TarifaCurso>(`/tarifas-curso/${tarifaId}`, payload)
export const obtenerTarifaCurso = (tarifaId: UUID) => httpClient.get<TarifaCurso>(`/tarifas-curso/${tarifaId}`)
export const eliminarTarifaCurso = (tarifaId: UUID) => httpClient.delete<void>(`/tarifas-curso/${tarifaId}`)
export const listTarifas = () => httpClient.get<TarifaCurso[]>('/tarifas-curso')
export const listarTarifasPorOferta = (ofertaId: UUID) =>
  httpClient.get<TarifaCurso[]>(`/tarifas-curso/oferta/${ofertaId}`)

// Cargos
export const crearCargo = (payload: CargoCreateDTO) => httpClient.post<Cargo>('/cargos', payload)
export const actualizarCargo = (cargoId: UUID, payload: CargoUpdateDTO) =>
  httpClient.put<Cargo>(`/cargos/${cargoId}`, payload)
export const obtenerCargo = (cargoId: UUID) => httpClient.get<Cargo>(`/cargos/${cargoId}`)
export const eliminarCargo = (cargoId: UUID) => httpClient.delete<void>(`/cargos/${cargoId}`)
export const listarCargosPorTarifa = (tarifaId: UUID) => httpClient.get<Cargo[]>(`/cargos/tarifa/${tarifaId}`)
export const recalcularCargo = (cargoId: UUID) => httpClient.post<Cargo>(`/cargos/${cargoId}/recalcular`)

// Recibos y detalle
export const registrarRecibo = (payload: ReciboCreateDTO) => httpClient.post<Recibo>('/recibos', payload)
export const obtenerRecibo = (reciboId: UUID) => httpClient.get<Recibo>(`/recibos/${reciboId}`)
export const actualizarRecibo = (reciboId: UUID, payload: ReciboUpdateDTO) =>
  httpClient.put<Recibo>(`/recibos/${reciboId}`, payload)
export const listarRecibosPorAlumno = (alumnoId: UUID) =>
  httpClient.get<Recibo[]>(`/recibos/alumno/${alumnoId}`)

type ReciboQueryParams = {
  alumnoId?: string | UUID
  estado?: ReciboEstado
  fechaDesde?: string
  fechaHasta?: string
}

export const listarRecibosConOfertas = (params: ReciboQueryParams = {}) => {
  const query = new URLSearchParams()
  if (params.alumnoId) query.append('alumnoId', String(params.alumnoId))
  if (params.estado) query.append('estado', params.estado)
  if (params.fechaDesde) query.append('fechaDesde', params.fechaDesde)
  if (params.fechaHasta) query.append('fechaHasta', params.fechaHasta)

  const suffix = query.toString()
  return httpClient.get<ReciboConOfertasDTO[]>(`/recibos${suffix ? `?${suffix}` : ''}`)
}
export const registrarDetalleRecibo = (payload: DetalleReciboCreateDTO) =>
  httpClient.post<DetalleRecibo>('/detalle-recibo', payload)
export const listarDetalleReciboPorRecibo = (reciboId: UUID) =>
  httpClient.get<DetalleRecibo[]>(`/detalle-recibo/recibo/${reciboId}`)

// Estado de cuenta
export const obtenerEstadoCuenta = (alumnoId: UUID) =>
  httpClient.get<EstadoCuenta>(`/alumnos/${alumnoId}/estado-cuenta`)

/* ===========================
 *        MÓDULO B
 * =========================== */

// Cursos catálogo
type ListCursosCatalogoQuery = PageableQuery & { nombre?: string }

export const listCursosCatalogo = (query?: ListCursosCatalogoQuery) => {
  const pageQuery: PageableQuery | undefined = query
    ? { page: query.page, size: query.size, sort: query.sort }
    : undefined

  return httpClient.get<Page<CursoCatalogo>>(
    '/cursos-catalogo',
    withPagination(pageQuery, { nombre: query?.nombre }),
  )
}
export const getCursoCatalogo = (id: UUID) => httpClient.get<CursoCatalogo>(`/cursos-catalogo/${id}`)
export const createCursoCatalogo = (payload: CursoCatalogoCreateDTO) =>
  httpClient.post<CursoCatalogo>('/cursos-catalogo', payload)
export const updateCursoCatalogo = (id: UUID, payload: CursoCatalogoUpdateDTO) =>
  httpClient.put<CursoCatalogo>(`/cursos-catalogo/${id}`, payload)
export const deleteCursoCatalogo = (id: UUID) => httpClient.delete<void>(`/cursos-catalogo/${id}`)

// Ofertas de curso
type ListOfertasCursoQuery = PageableQuery & {
  gradoId?: UUID
  institutoId?: UUID
  cursoId?: UUID
  status?: string | string[]
}

type OfertaCursoConDetalles = OfertaCurso & {
  cursoNombre?: string | null
  curso?: { nombre?: string | null } | null
  diaSemana?: string | null
  horaFin?: string | null
}

export type OfertaCatalogoItem = {
  id: UUID
  cursoNombre: string
  dia: string | null
  horaInicio: string | null
  horaFin: string | null
}

export const listOfertasCurso = (query?: ListOfertasCursoQuery) => {
  const pageQuery: PageableQuery | undefined = query
    ? { page: query.page, size: query.size, sort: query.sort }
    : undefined

  return httpClient.get<Page<OfertaCurso>>(
    '/ofertas-curso',
    withPagination(pageQuery, {
      gradoId: query?.gradoId,
      institutoId: query?.institutoId,
      cursoId: query?.cursoId,
      status: query?.status,
    }),
  )
}
export const getOfertaCurso = (id: UUID) => httpClient.get<OfertaCurso>(`/ofertas-curso/${id}`)
export const createOfertaCurso = (payload: OfertaCursoCreateDTO) =>
  httpClient.post<OfertaCurso>('/ofertas-curso', payload)
export const updateOfertaCurso = (id: UUID, payload: OfertaCursoUpdateDTO) =>
  httpClient.put<OfertaCurso>(`/ofertas-curso/${id}`, payload)
export const deleteOfertaCurso = (id: UUID) => httpClient.delete<void>(`/ofertas-curso/${id}`)

const needsCursoNombre = (oferta: OfertaCursoConDetalles) => {
  const nombreDirecto = oferta.cursoNombre?.trim()
  const nombreEmbebido = oferta.curso?.nombre?.trim()
  return !(nombreDirecto && nombreDirecto.length > 0) && !(nombreEmbebido && nombreEmbebido.length > 0)
}

const normalizarCursoNombre = (
  oferta: OfertaCursoConDetalles,
  cursosDiccionario: Map<string, string> | null,
): string => {
  const nombreDirecto = oferta.cursoNombre?.trim()
  if (nombreDirecto && nombreDirecto.length > 0) return nombreDirecto

  const nombreEmbebido = oferta.curso?.nombre?.trim()
  if (nombreEmbebido && nombreEmbebido.length > 0) return nombreEmbebido

  if (cursosDiccionario) {
    const lookup = cursosDiccionario.get(String(oferta.cursoId))?.trim()
    if (lookup && lookup.length > 0) return lookup
  }

  return 'Curso'
}

const normalizarTexto = (value?: string | null): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const listarOfertasCatalogo = async (
  params: Partial<ListOfertasCursoQuery> = {},
): Promise<OfertaCatalogoItem[]> => {
  const {
    page = 0,
    size = 200,
    sort = 'fechaInicio,desc',
    gradoId,
    institutoId,
    cursoId,
    status,
  } = params

  const ofertasPage = await listOfertasCurso({
    page,
    size,
    sort,
    gradoId,
    institutoId,
    cursoId,
    status,
  })

  const ofertas = ofertasPage.content as OfertaCursoConDetalles[]

  const requiereCatalogo = ofertas.some(needsCursoNombre)

  let cursosDiccionario: Map<string, string> | null = null
  if (requiereCatalogo) {
    const cursosPage = await listCursosCatalogo({ page: 0, size: 500, sort: 'nombre,asc' })
    cursosDiccionario = new Map(
      cursosPage.content
        .filter((curso) => curso && curso.id)
        .map((curso) => [String(curso.id), curso.nombre ?? 'Curso']),
    )
  }

  return ofertas.map<OfertaCatalogoItem>((oferta) => ({
    id: oferta.id,
    cursoNombre: normalizarCursoNombre(oferta, cursosDiccionario),
    dia: normalizarTexto(oferta.dia ?? oferta.diaSemana ?? null),
    horaInicio: normalizarTexto(oferta.horaInicio ?? null),
    horaFin: normalizarTexto(oferta.horaFin ?? oferta.horaFinalizacion ?? null),
  }))
}

// Inscripciones
export const listInscripciones = (query?: PageableQuery) =>
  httpClient.get<Page<Inscripcion>>('/inscripciones', withPagination(query))
export const getInscripcion = (id: UUID) => httpClient.get<Inscripcion>(`/inscripciones/${id}`)
export const createInscripcion = (payload: InscripcionCreateDTO) =>
  httpClient.post<Inscripcion>('/inscripciones', payload)
export const updateInscripcion = (id: UUID, payload: InscripcionUpdateDTO) =>
  httpClient.put<Inscripcion>(`/inscripciones/${id}`, payload)
export const deleteInscripcion = (id: UUID) => httpClient.delete<void>(`/inscripciones/${id}`)
export const listInscripcionesPorAlumno = (alumnoId: UUID) =>
  httpClient.get<Inscripcion[]>(`/inscripciones/alumno/${alumnoId}`)
export const listInscripcionesPorOferta = (ofertaId: UUID) =>
  httpClient.get<Inscripcion[]>(`/inscripciones/oferta/${ofertaId}`)
