import {
  crearUnidadEvaluacion as apiCrearUnidadEvaluacion,
  listarUnidadesPorOferta as apiListarUnidadesPorOferta,
} from '../api/client'
import type { UnidadEvaluacionCreateDTO } from '../contract/moduleC'
import type { UUID } from '../contract/moduleA'

export const crearUnidadEvaluacion = (payload: UnidadEvaluacionCreateDTO) =>
  apiCrearUnidadEvaluacion(payload)

export const listarUnidadesPorOferta = (ofertaId: UUID) => apiListarUnidadesPorOferta(ofertaId)
