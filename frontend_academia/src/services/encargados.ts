import {
  createEncargado as apiCreateEncargado,
  deleteEncargado as apiDeleteEncargado,
  getEncargado as apiGetEncargado,
  listEncargados as apiListEncargados,
  updateEncargado as apiUpdateEncargado,
} from '../api/client'
import type { Page, PageableQuery } from '../contract/pagination'
import type { Encargado, EncargadoCreateUpdateDTO, UUID } from '../contract/moduleA'

export type ListEncargadosParams = PageableQuery & {
  // TODO(backend): habilitar filtros/busqueda en /encargados.
  search?: string
}

export const listEncargados = (params: ListEncargadosParams = {}): Promise<Page<Encargado>> => {
  const { search: _search, ...pageable } = params
  return apiListEncargados(pageable)
}

export const getEncargado = (id: UUID) => apiGetEncargado(id)

export const createEncargado = (payload: EncargadoCreateUpdateDTO) => apiCreateEncargado(payload)

export const updateEncargado = (id: UUID, payload: EncargadoCreateUpdateDTO) =>
  apiUpdateEncargado(id, payload)

export const removeEncargado = (id: UUID) => apiDeleteEncargado(id)
