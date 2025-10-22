import {
  actualizarRecibo as apiActualizarRecibo,
  listarRecibosConOfertas as apiListarRecibosConOfertas,
  listarRecibosPorAlumno as apiListarRecibosPorAlumno,
  obtenerRecibo as apiObtenerRecibo,
  registrarRecibo as apiRegistrarRecibo,
} from '../api/client'
import type {
  ReciboConOfertasDTO,
  ReciboCreateDTO,
  ReciboEstado,
  ReciboUpdateDTO,
} from '../contract/moduleC'
import type { UUID } from '../contract/moduleA'

export const registrarRecibo = (payload: ReciboCreateDTO) => {
  const { alumnoId, fecha, total, estado } = payload

  const body: ReciboCreateDTO = { alumnoId }

  if (fecha !== undefined) body.fecha = fecha
  if (total !== undefined) body.total = total
  if (estado !== undefined) body.estado = estado

  return apiRegistrarRecibo(body)
}

export const crearRecibo = registrarRecibo

export const obtenerReciboPorId = (reciboId: UUID) => apiObtenerRecibo(reciboId)

export const obtenerRecibo = obtenerReciboPorId

export const actualizarRecibo = (reciboId: UUID, payload: ReciboUpdateDTO) => {
  const body: ReciboUpdateDTO = {}

  if (payload.fecha !== undefined) body.fecha = payload.fecha
  if (payload.total !== undefined) body.total = payload.total
  if (payload.estado !== undefined) body.estado = payload.estado

  return apiActualizarRecibo(reciboId, body)
}

export const listarRecibosPorAlumno = (alumnoId: UUID) => apiListarRecibosPorAlumno(alumnoId)

type ReciboConOfertasQuery = {
  alumnoId?: string
  estado?: ReciboEstado
  fechaDesde?: string
  fechaHasta?: string
}

export const listarRecibosConOfertas = (
  filtros: ReciboConOfertasQuery = {},
): Promise<ReciboConOfertasDTO[]> => apiListarRecibosConOfertas(filtros)
