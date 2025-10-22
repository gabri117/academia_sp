import type { UUID } from './moduleA'

export const OFERTA_STATUS = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'] as const
export type OfertaStatus = (typeof OFERTA_STATUS)[number]

export interface CursoCatalogo extends Record<string, unknown> {
  id: UUID
  nombre: string
  nivelCurso?: string | null
  duracion?: string | null
}

export interface CursoCatalogoCreateDTO extends Record<string, unknown> {
  nombre: string
  nivelCurso?: string | null
  duracion?: string | null
}

export type CursoCatalogoUpdateDTO = CursoCatalogoCreateDTO

export interface OfertaCurso extends Record<string, unknown> {
  id: UUID
  gradoId: UUID
  institutoId: UUID
  cursoId: UUID
  dia?: string | null
  horaInicio: string
  horaFinalizacion: string
  fechaInicio: string
  fechaFinalizacion: string
  capacidad: number
  status: OfertaStatus
}

export interface OfertaCursoCreateDTO extends Record<string, unknown> {
  gradoId: UUID
  institutoId: UUID
  cursoId: UUID
  dia?: string | null
  horaInicio: string
  horaFinalizacion: string
  fechaInicio: string
  fechaFinalizacion: string
  capacidad: number
  status: OfertaStatus
}

export type OfertaCursoUpdateDTO = OfertaCursoCreateDTO

export interface Inscripcion extends Record<string, unknown> {
  id: UUID
  alumnoId: UUID
  ofertaId: UUID
  fechaInscripcion: string
  estado: string
}

export interface InscripcionCreateDTO extends Record<string, unknown> {
  alumnoId: UUID
  ofertaId: UUID
  fechaInscripcion: string
  estado: string
}

export type InscripcionUpdateDTO = InscripcionCreateDTO
