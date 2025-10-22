import {
  createInscripcion as apiCreateInscripcion,
  deleteInscripcion as apiDeleteInscripcion,
  getInscripcion as apiGetInscripcion,
  listInscripciones as apiListInscripciones,
  listInscripcionesPorAlumno as apiListInscripcionesPorAlumno,
  listInscripcionesPorOferta as apiListInscripcionesPorOferta,
  updateInscripcion as apiUpdateInscripcion,
} from '../api/client'
import type {
  Inscripcion,
  InscripcionCreateDTO,
  InscripcionUpdateDTO,
} from '../contract/moduleB'
import type { Page, PageableQuery } from '../contract/pagination'
import type { UUID } from '../contract/moduleA'

export type ListInscripcionesParams = PageableQuery

export interface InscripcionDTO {
  id?: string
  alumnoId: string
  ofertaId: string
  fechaInscripcion: string
  estado: string
}

export const listInscripciones = (
  params: ListInscripcionesParams = {},
): Promise<Page<Inscripcion>> => {
  const { page, size, sort } = params
  return apiListInscripciones({ page, size, sort })
}

export const getInscripcion = (id: UUID) => apiGetInscripcion(id)

const mapInscripcion = (raw: any): InscripcionDTO => {
  if (!raw) {
    return {
      alumnoId: '',
      ofertaId: '',
      fechaInscripcion: '',
      estado: 'activo',
    }
  }

  const alumnoId = raw.alumnoId ?? raw.alumno_id ?? raw.alumno ?? ''
  const ofertaId = raw.ofertaId ?? raw.oferta_id ?? raw.oferta ?? ''
  const fecha =
    raw.fechaInscripcion ??
    raw.fecha_inscripcion ??
    raw.fecha ??
    ''
  const estadoRaw = raw.estado ?? raw.status ?? 'activo'

  return {
    id: raw.id ?? raw.ID ?? undefined,
    alumnoId: String(alumnoId),
    ofertaId: String(ofertaId),
    fechaInscripcion: String(fecha),
    estado: String(estadoRaw).toLowerCase(),
  }
}

export const obtenerInscripcionPorId = async (id: UUID): Promise<InscripcionDTO> => {
  const data = await apiGetInscripcion(id)
  return mapInscripcion(data)
}

export const createInscripcion = (payload: InscripcionCreateDTO) => apiCreateInscripcion(payload)

export const updateInscripcion = (id: UUID, payload: InscripcionUpdateDTO) =>
  apiUpdateInscripcion(id, payload)

export const actualizarInscripcion = (id: UUID, payload: InscripcionDTO) => {
  const { alumnoId, ofertaId, fechaInscripcion, estado } = payload
  return apiUpdateInscripcion(id, {
    alumnoId,
    ofertaId,
    fechaInscripcion,
    estado,
  })
}

export const removeInscripcion = (id: UUID) => apiDeleteInscripcion(id)

export const listInscripcionesByAlumno = (alumnoId: UUID) => apiListInscripcionesPorAlumno(alumnoId)

export const listInscripcionesByOferta = (ofertaId: UUID) => apiListInscripcionesPorOferta(ofertaId)

export const listarInscripciones = listInscripciones

export const listarInscripcionesPorAlumno = listInscripcionesByAlumno

export const listarInscripcionesPorOferta = listInscripcionesByOferta
