import {
  listarDetalleReciboPorRecibo as apiListarDetalleReciboPorRecibo,
  registrarDetalleRecibo as apiRegistrarDetalleRecibo,
} from '../api/client'
import type { DetalleReciboCreateDTO } from '../contract/moduleC'
import type { UUID } from '../contract/moduleA'

export const registrarDetalleRecibo = (payload: DetalleReciboCreateDTO) =>
  apiRegistrarDetalleRecibo(payload)

export const listarDetalleReciboPorRecibo = (reciboId: UUID) =>
  apiListarDetalleReciboPorRecibo(reciboId)
