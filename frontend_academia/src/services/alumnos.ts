import {
  createAlumno as apiCreateAlumno,
  deleteAlumno as apiDeleteAlumno,
  getAlumno as apiGetAlumno,
  listAlumnos as apiListAlumnos,
  updateAlumno as apiUpdateAlumno,
} from '../api/client'
import type { Page, PageableQuery } from '../contract/pagination'
import type { Alumno, AlumnoCreateDTO, AlumnoUpdateDTO, UUID } from '../contract/moduleA'

export type ListAlumnosParams = PageableQuery & {
  // TODO(backend): soportar filtros/busqueda en /alumnos.
  search?: string
}

export const listAlumnos = (params: ListAlumnosParams = {}): Promise<Page<Alumno>> => {
  const { search: _search, ...pageable } = params
  return apiListAlumnos(pageable)
}

export const listAlumnosParaCombo = (params: PageableQuery = { page: 0, size: 100, sort: 'nombre,asc' }) =>
  apiListAlumnos(params)

export const getAlumno = (id: UUID) => apiGetAlumno(id)

export const createAlumno = (payload: AlumnoCreateDTO) => apiCreateAlumno(payload)

export const updateAlumno = (id: UUID, payload: AlumnoUpdateDTO) => apiUpdateAlumno(id, payload)

export const removeAlumno = (id: UUID) => apiDeleteAlumno(id)
