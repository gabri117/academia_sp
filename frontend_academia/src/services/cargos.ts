import {
  actualizarCargo as apiActualizarCargo,
  crearCargo as apiCrearCargo,
  eliminarCargo as apiEliminarCargo,
  listarCargosPorTarifa as apiListarCargosPorTarifa,
  obtenerCargo as apiObtenerCargo,
  recalcularCargo as apiRecalcularCargo,
} from '../api/client'
import type { CargoCreateDTO, CargoUpdateDTO } from '../contract/moduleC'
import type { UUID } from '../contract/moduleA'

export const crearCargo = (payload: CargoCreateDTO) => apiCrearCargo(payload)

export const actualizarCargo = (cargoId: UUID, payload: CargoUpdateDTO) =>
  apiActualizarCargo(cargoId, payload)

export const obtenerCargo = (cargoId: UUID) => apiObtenerCargo(cargoId)

export const eliminarCargo = (cargoId: UUID) => apiEliminarCargo(cargoId)

export const listarCargosPorTarifa = (tarifaId: UUID) => apiListarCargosPorTarifa(tarifaId)

export const recalcularCargo = (cargoId: UUID) => apiRecalcularCargo(cargoId)
