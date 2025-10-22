export type UUID = string

export const ALUMNO_ESTADO = ['activo', 'inactivo'] as const
export type AlumnoEstado = (typeof ALUMNO_ESTADO)[number]

export const JORNADA = ['Matutina', 'Vespertina', 'Nocturna'] as const
export type Jornada = (typeof JORNADA)[number]

export interface Alumno extends Record<string, unknown> {
  id: UUID
  institutoId: UUID
  nombre: string
  apellido: string
  telefono?: string | null
  direccion?: string | null
  carnet?: string | null
  fechaNacimiento?: string | null
  estado: AlumnoEstado
}

export interface AlumnoCreateDTO extends Record<string, unknown> {
  institutoId: UUID
  nombre: string
  apellido: string
  telefono?: string | null
  direccion?: string | null
  carnet?: string | null
  fechaNacimiento?: string | null
  estado?: AlumnoEstado
}

export interface AlumnoUpdateDTO extends Record<string, unknown> {
  institutoId?: UUID
  nombre: string
  apellido: string
  telefono?: string | null
  direccion?: string | null
  carnet?: string | null
  fechaNacimiento?: string | null
  estado?: AlumnoEstado
}

export interface Encargado extends Record<string, unknown> {
  id: UUID
  nombre: string
  apellido: string
  telefono?: string | null
}

export interface EncargadoCreateUpdateDTO extends Record<string, unknown> {
  nombre: string
  apellido: string
  telefono?: string | null
}

export interface Establecimiento extends Record<string, unknown> {
  institutoId: UUID
  nombre: string
  direccion?: string | null
  nombreDirector?: string | null
  telefono?: string | null
  jornada: Jornada
}

export interface EstablecimientoCreateUpdateDTO extends Record<string, unknown> {
  nombre: string
  direccion?: string | null
  nombreDirector?: string | null
  telefono?: string | null
  jornada: Jornada
}

export interface Nivel extends Record<string, unknown> {
  nivelId: UUID
  nombre: string
}

export type NivelCreateUpdateDTO = Pick<Nivel, 'nombre'>

export interface Grado extends Record<string, unknown> {
  gradoId: UUID
  nivelId: UUID
  nombre: string
}

export interface GradoCreateUpdateDTO extends Record<string, unknown> {
  nivelId: UUID
  nombre: string
}

export interface AlumnoEncargado extends Record<string, unknown> {
  alumnoId: UUID
  alumnoNombreCompleto: string
  encargadoId: UUID
  encargadoNombreCompleto: string
}

export interface VinculoAlumnoEncargadoRequest extends Record<string, unknown> {
  alumnoId: UUID
  encargadoId: UUID
  // TODO(backend): definir si se requieren campos adicionales en el payload de vinculacion.
}
