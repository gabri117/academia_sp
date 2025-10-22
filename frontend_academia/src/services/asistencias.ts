import {
  listAsistenciasPorInscripcion as apiListAsistenciasPorInscripcion,
  listAsistenciasPorSesion as apiListAsistenciasPorSesion,
  registrarAsistencia as apiRegistrarAsistencia,
} from '../api/client'
import type { AsistenciaCreateDTO } from '../contract/moduleC'
import type { UUID } from '../contract/moduleA'

export const registrarAsistencia = (payload: AsistenciaCreateDTO) =>
  apiRegistrarAsistencia(payload)

export const listAsistenciasPorSesion = (sessionId: UUID) => apiListAsistenciasPorSesion(sessionId)

export const listAsistenciasPorInscripcion = (inscripcionId: UUID) =>
  apiListAsistenciasPorInscripcion(inscripcionId)
