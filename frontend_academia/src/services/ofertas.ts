import {
  createOfertaCurso as apiCreateOfertaCurso,
  deleteOfertaCurso as apiDeleteOfertaCurso,
  getOfertaCurso as apiGetOfertaCurso,
  listOfertasCurso as apiListOfertasCurso,
  updateOfertaCurso as apiUpdateOfertaCurso,
} from '../api/client'
import type { OfertaCurso, OfertaCursoCreateDTO, OfertaCursoUpdateDTO } from '../contract/moduleB'
import type { UUID } from '../contract/moduleA'
import type { Page, PageableQuery } from '../contract/pagination'

export type ListOfertasCursoParams = PageableQuery & {
  gradoId?: UUID
  institutoId?: UUID
  cursoId?: UUID
  status?: string | string[]
}

export type ListOfertasParaComboParams = ListOfertasCursoParams

export const listOfertasCurso = (
  params: ListOfertasCursoParams = {},
): Promise<Page<OfertaCurso>> => {
  const { gradoId, institutoId, cursoId, status, ...pageable } = params
  return apiListOfertasCurso({
    ...pageable,
    gradoId,
    institutoId,
    cursoId,
    status,
  })
}

export const listOfertasParaCombo = (params: ListOfertasParaComboParams = {}) => {
  const { page = 0, size = 100, sort = 'fechaInicio,desc', ...filters } = params

  return apiListOfertasCurso({
    ...filters,
    page,
    size,
    sort,
    status: ['PROGRAMADO', 'EN_CURSO'],
  })
}

export const listarOfertasParaFiltro = (
  params: Partial<ListOfertasCursoParams> = {},
): Promise<Page<OfertaCurso>> => {
  const { page = 0, size = 200, sort = 'fechaInicio,desc', ...filters } = params

  return apiListOfertasCurso({
    page,
    size,
    sort,
    ...filters,
  })
}

export const getOfertaCurso = (id: UUID) => apiGetOfertaCurso(id)

export const createOfertaCurso = (payload: OfertaCursoCreateDTO) => apiCreateOfertaCurso(payload)

export const updateOfertaCurso = (id: UUID, payload: OfertaCursoUpdateDTO) =>
  apiUpdateOfertaCurso(id, payload)

export const removeOfertaCurso = (id: UUID) => apiDeleteOfertaCurso(id)
