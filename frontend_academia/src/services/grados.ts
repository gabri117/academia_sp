import {
  createGrado as apiCreateGrado,
  deleteGrado as apiDeleteGrado,
  getGrado as apiGetGrado,
  listGrados as apiListGrados,
  listGradosPorNivel as apiListGradosPorNivel,
  updateGrado as apiUpdateGrado,
} from '../api/client'
import type { Grado, GradoCreateUpdateDTO, UUID } from '../contract/moduleA'
import type { Page } from '../contract/pagination'

export type ListGradosParams = {
  page?: number
  size?: number
  sort?: string
}

export const listGrados = async (params: ListGradosParams = {}): Promise<Page<Grado>> => {
  const { page = 0, size = 200, sort: _sort = 'nombre,asc' } = params
  // TODO(backend): exponer paginacion y ordenamiento en /grados-academicos.
  // For now, return a Page-like structure
  const content = await apiListGrados()
  // Simulate pagination: slice the content based on page and size
  const start = page * size
  const end = start + size
  const paginatedContent = content.slice(start, end)
  return {
    content: paginatedContent,
    totalElements: content.length,
    totalPages: Math.ceil(content.length / size),
    size: paginatedContent.length,
    number: page,
  }
}

export const listGradosByNivel = (nivelId: UUID): Promise<Grado[]> =>
  apiListGradosPorNivel(nivelId)

export const getGrado = (gradoId: UUID) => apiGetGrado(gradoId)

export const createGrado = (payload: GradoCreateUpdateDTO) => apiCreateGrado(payload)

export const updateGrado = (gradoId: UUID, payload: GradoCreateUpdateDTO) =>
  apiUpdateGrado(gradoId, payload)

export const removeGrado = (gradoId: UUID) => apiDeleteGrado(gradoId)
