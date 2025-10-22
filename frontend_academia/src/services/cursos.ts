import apiClient from '../api/axios'

const basePath = '/cursos'

export const fetchCursos = <T = unknown>() => apiClient.get<T>(basePath)

export const fetchCursoById = <T = unknown>(id: string | number) => apiClient.get<T>(`${basePath}/${id}`)

export const createCurso = <T = unknown>(payload: Record<string, unknown>) =>
  apiClient.post<T>(basePath, payload)

export const updateCurso = <T = unknown>(id: string | number, payload: Record<string, unknown>) =>
  apiClient.put<T>(`${basePath}/${id}`, payload)

export const deleteCurso = (id: string | number) => apiClient.delete<void>(`${basePath}/${id}`)