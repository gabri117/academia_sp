import {
  createSesionClase as apiCreateSesionClase,
  listSesionesPorOferta as apiListSesionesPorOferta,
  listSesionesPorRango as apiListSesionesPorRango,
} from '../api/client'
import type { SesionClaseCreateDTO, SesionClaseRangeQuery } from '../contract/moduleC'
import type { UUID } from '../contract/moduleA'

export const createSesionClase = (payload: SesionClaseCreateDTO) => apiCreateSesionClase(payload)

export const listSesionesPorOferta = (ofertaId: UUID) => apiListSesionesPorOferta(ofertaId)

export const listSesionesPorRango = (ofertaId: UUID, range?: SesionClaseRangeQuery) =>
  apiListSesionesPorRango(ofertaId, range)
