import {
  desvincularAlumnoEncargado as apiDesvincularAlumnoEncargado,
  listarAlumnosPorEncargado as apiListarAlumnosPorEncargado,
  listarEncargadosPorAlumno as apiListarEncargadosPorAlumno,
  vincularAlumnoEncargado as apiVincularAlumnoEncargado,
} from '../api/client'
import type {
  AlumnoEncargado,
  UUID,
  VinculoAlumnoEncargadoRequest,
} from '../contract/moduleA'

export const listEncargadosPorAlumno = (alumnoId: UUID): Promise<AlumnoEncargado[]> =>
  apiListarEncargadosPorAlumno(alumnoId)

export const listAlumnosPorEncargado = (encargadoId: UUID): Promise<AlumnoEncargado[]> =>
  apiListarAlumnosPorEncargado(encargadoId)

export const createAlumnoEncargado = (payload: VinculoAlumnoEncargadoRequest) =>
  apiVincularAlumnoEncargado(payload)

export const removeAlumnoEncargado = (alumnoId: UUID, encargadoId: UUID) =>
  apiDesvincularAlumnoEncargado(alumnoId, encargadoId)
