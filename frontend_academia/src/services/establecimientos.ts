import {
  createEstablecimiento as apiCreateEstablecimiento,
  deleteEstablecimiento as apiDeleteEstablecimiento,
  getEstablecimiento as apiGetEstablecimiento,
  listEstablecimientos as apiListEstablecimientos,
  updateEstablecimiento as apiUpdateEstablecimiento,
} from '../api/client'
import type { Page, PageableQuery } from '../contract/pagination'
import type {
  Establecimiento,
  EstablecimientoCreateUpdateDTO,
  UUID,
} from '../contract/moduleA'

export type ListEstablecimientosParams = PageableQuery & {
  // TODO(backend): exponer búsqueda en /establecimientos.
  search?: string
}

export const listEstablecimientos = (
  params: ListEstablecimientosParams = {},
): Promise<Page<Establecimiento>> => {
  const { search: _search, ...pageable } = params
  const { page = 0, size = 100, sort = 'nombre,asc' } = pageable
  return apiListEstablecimientos({ page, size, sort })
}

export const getEstablecimiento = (institutoId: UUID) => apiGetEstablecimiento(institutoId)

export const createEstablecimiento = (payload: EstablecimientoCreateUpdateDTO) =>
  apiCreateEstablecimiento(payload)

export const updateEstablecimiento = (institutoId: UUID, payload: EstablecimientoCreateUpdateDTO) =>
  apiUpdateEstablecimiento(institutoId, payload)

export const removeEstablecimiento = (institutoId: UUID) => apiDeleteEstablecimiento(institutoId)
