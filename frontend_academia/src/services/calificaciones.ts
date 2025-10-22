import {
  listarCalificacionesPorInscripcion as apiListarCalificacionesPorInscripcion,
  listarCalificacionesPorOferta as apiListarCalificacionesPorOferta,
  registrarCalificacion as apiRegistrarCalificacion,
} from '../api/client'
import type { CalificacionCreateDTO } from '../contract/moduleC'
import type { UUID } from '../contract/moduleA'

export const registrarCalificacion = (payload: CalificacionCreateDTO) =>
  apiRegistrarCalificacion(payload)

export const listarCalificacionesPorInscripcion = (inscripcionId: UUID) =>
  apiListarCalificacionesPorInscripcion(inscripcionId)

export const listarCalificacionesPorOferta = (ofertaId: UUID) =>
  apiListarCalificacionesPorOferta(ofertaId)
