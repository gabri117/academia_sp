import { httpClient } from '../../api/client'
import type { Recibo, ReciboCreateDTO, ReciboUpdateDTO, UUID } from '../../contract/moduleC'

//Coment4
// Obtener un recibo por ID
export const obtenerReciboPorId = (id: UUID) =>
  httpClient.get<Recibo>(`/recibos/${id}`)

// Listar recibos por alumno
export const listarRecibosPorAlumno = (alumnoId: UUID) =>
  httpClient.get<Recibo[]>(`/recibos/alumno/${alumnoId}`)

// Crear recibo
export const crearRecibo = (payload: ReciboCreateDTO) =>
  httpClient.post<Recibo>('/recibos', payload)

// Actualizar recibo
export const actualizarRecibo = (id: UUID, payload: ReciboUpdateDTO) =>
  httpClient.put<Recibo>(`/recibos/${id}`, payload)
