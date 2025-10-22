import {
  actualizarTarifaCurso as apiActualizarTarifaCurso,
  crearTarifaCurso as apiCrearTarifaCurso,
  eliminarTarifaCurso as apiEliminarTarifaCurso,
  listTarifas as apiListTarifas,
  listarTarifasPorOferta as apiListarTarifasPorOferta,
  obtenerTarifaCurso as apiObtenerTarifaCurso,
} from '../api/client'
import type { TarifaCursoCreateDTO, TarifaCursoUpdateDTO } from '../contract/moduleC'
import type { UUID } from '../contract/moduleA'

export const crearTarifaCurso = (payload: TarifaCursoCreateDTO) => apiCrearTarifaCurso(payload)

export const actualizarTarifaCurso = (tarifaId: UUID, payload: TarifaCursoUpdateDTO) =>
  apiActualizarTarifaCurso(tarifaId, payload)

export const obtenerTarifaCurso = (tarifaId: UUID) => apiObtenerTarifaCurso(tarifaId)

export const eliminarTarifaCurso = (tarifaId: UUID) => apiEliminarTarifaCurso(tarifaId)

export const listarTarifasPorOferta = (ofertaId: UUID) => apiListarTarifasPorOferta(ofertaId)

export const listarTarifas = () => apiListTarifas()


