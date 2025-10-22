import { z } from 'zod'

import { ALUMNO_ESTADO, JORNADA } from '../contract/moduleA'
import { CARGO_ESTADO, MES, MIN_DECIMAL, RECIBO_ESTADO } from '../contract/moduleC'
import { OFERTA_STATUS } from '../contract/moduleB'

const DATE_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
const DECIMAL_PRECISION = 100
const ZERO_DECIMAL = Number.parseFloat(MIN_DECIMAL)

const hasTwoDecimals = (value: number): boolean =>
  Number.isFinite(value) &&
  Math.abs(value * DECIMAL_PRECISION - Math.round(value * DECIMAL_PRECISION)) < 1e-6

const decimalNumber = (field: string, { min, max }: { min: number; max?: number }) => {
  let schema = z
    .number({
      invalid_type_error: `${field} debe ser un numero`,
    })
    .min(min, `${field} debe ser mayor o igual a ${min.toFixed(2)}`)
    .refine(hasTwoDecimals, `${field} debe tener hasta dos decimales`)

  if (typeof max === 'number') {
    schema = schema.max(max, `${field} debe ser menor o igual a ${max.toFixed(2)}`)
  }

  return schema
}

const requiredDate = (field = 'Fecha') =>
  z
    .string()
    .trim()
    .regex(DATE_REGEX, `${field} debe tener el formato yyyy-MM-dd`)

export const uuidSchema = (field: string) => z.string().uuid(`${field} debe ser un UUID valido`)

export const requiredString = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} es requerido`)
    .max(max, `${field} admite maximo ${max} caracteres`)

export const optionalString = (field: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${field} admite maximo ${max} caracteres`)
    .optional()

export const optionalPhone = (field = 'Telefono') =>
  z
    .string()
    .trim()
    .max(15, `${field} admite maximo 15 caracteres`)
    .regex(/^[0-9+\-()\s]+$/, `${field} solo permite numeros, espacios y simbolos + - ( )`)
    .optional()

export const optionalDate = (field = 'Fecha') => requiredDate(field).optional()

const alumnoFields = {
  nombre: requiredString('Nombre', 50),
  apellido: requiredString('Apellido', 50),
  telefono: optionalPhone('Telefono'),
  direccion: optionalString('Direccion', 100),
  carnet: optionalString('Carnet', 20),
  fechaNacimiento: optionalDate('Fecha de nacimiento'),
}

export const alumnoCreateSchema = z.object({
  institutoId: uuidSchema('institutoId'),
  estado: z.enum(ALUMNO_ESTADO).optional(),
  ...alumnoFields,
})

export const alumnoUpdateSchema = z.object({
  institutoId: uuidSchema('institutoId').optional(),
  estado: z.enum(ALUMNO_ESTADO).optional(),
  ...alumnoFields,
})

export const encargadoSchema = z.object({
  nombre: requiredString('Nombre', 50),
  apellido: requiredString('Apellido', 50),
  telefono: optionalPhone('Telefono'),
})

const establecimientoFields = {
  nombre: requiredString('Nombre', 100),
  direccion: optionalString('Direccion', 100),
  nombreDirector: optionalString('Nombre del director', 50),
  telefono: optionalPhone('Telefono'),
  jornada: z.enum(JORNADA),
}

export const establecimientoSchema = z.object({
  ...establecimientoFields,
})

export const nivelSchema = z.object({
  nombre: requiredString('Nombre', 20),
})

export const gradoSchema = z.object({
  nombre: requiredString('Nombre', 50),
  nivelId: uuidSchema('nivelId'),
})

export const vinculoAlumnoEncargadoSchema = z.object({
  alumnoId: uuidSchema('alumnoId'),
  encargadoId: uuidSchema('encargadoId'),
})

/* ======================
 * Módulo C (finanzas/academia)
 * ====================== */
export const sesionClaseCreateSchema = z.object({
  ofertaId: uuidSchema('ofertaId'),
  fecha: requiredDate('Fecha'),
})

export const sesionClaseRangeSchema = z
  .object({
    desde: requiredDate('Desde').optional(),
    hasta: requiredDate('Hasta').optional(),
  })
  .refine(
    (data) => data.desde !== undefined || data.hasta !== undefined,
    'Debes proporcionar al menos una fecha (desde o hasta)',
  )

export const asistenciaCreateSchema = z.object({
  sessionId: uuidSchema('sessionId'),
  inscripcionId: uuidSchema('inscripcionId'),
  presente: z.boolean(),
})

export const unidadEvaluacionCreateSchema = z.object({
  ofertaId: uuidSchema('ofertaId'),
  nombre: requiredString('Nombre', 25),
})

export const calificacionCreateSchema = z.object({
  inscripcionId: uuidSchema('inscripcionId'),
  evaluacionId: uuidSchema('evaluacionId'),
  nota: decimalNumber('Nota', { min: ZERO_DECIMAL, max: 100 }),
  observaciones: optionalString('Observaciones', 250),
})

export const tarifaCursoCreateSchema = z.object({
  ofertaId: uuidSchema('ofertaId'),
  montoInscripcion: decimalNumber('Monto de inscripcion', { min: ZERO_DECIMAL }),
  montoMensualidad: decimalNumber('Monto de mensualidad', { min: ZERO_DECIMAL }),
})

export const tarifaCursoUpdateSchema = z
  .object({
    ofertaId: uuidSchema('ofertaId'),
    montoInscripcion: decimalNumber('Monto de inscripcion', { min: ZERO_DECIMAL }).optional(),
    montoMensualidad: decimalNumber('Monto de mensualidad', { min: ZERO_DECIMAL }).optional(),
  })
  .refine(
    (data) => data.montoInscripcion !== undefined || data.montoMensualidad !== undefined,
    'Debes proporcionar al menos un campo para actualizar',
  )

export const cargoCreateSchema = z.object({
  tarifaId: uuidSchema('tarifaId'),
  periodoMes: z.enum(MES),
  concepto: requiredString('Concepto', 30),
  monto: decimalNumber('Monto', { min: ZERO_DECIMAL }),
  estado: z.enum(CARGO_ESTADO).optional(),
})

export const cargoUpdateSchema = z
  .object({
    periodoMes: z.enum(MES).optional(),
    concepto: requiredString('Concepto', 30).optional(),
    monto: decimalNumber('Monto', { min: ZERO_DECIMAL }).optional(),
    estado: z.enum(CARGO_ESTADO).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    'Debes proporcionar al menos un campo para actualizar',
  )

export const reciboCreateSchema = z.object({
  alumnoId: uuidSchema('alumnoId'),
  correlativoRecibo: optionalString('Correlativo', 20),
  fecha: optionalDate('Fecha'),
  total: decimalNumber('Total', { min: ZERO_DECIMAL }).optional(),
  estado: z.enum(RECIBO_ESTADO).optional(),
})

export const detalleReciboCreateSchema = z.object({
  reciboId: uuidSchema('reciboId'),
  cargoId: uuidSchema('cargoId'),
  montoAplicado: decimalNumber('Monto aplicado', { min: ZERO_DECIMAL }),
})

/* ======================
 * Módulo B (catálogos/ofertas/inscripciones)
 * ====================== */
export const cursoCatalogoSchema = z.object({
  nombre: requiredString('Nombre', 30),
  nivelCurso: optionalString('Nivel del curso', 20),
  duracion: optionalString('Duracion', 20),
})

const horaSchema = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}:\d{2}$/, { message })

const fechaRequerida = (fieldMessage: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: fieldMessage })

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const
const DIAS_SEMANA_SET = new Set(DIAS_SEMANA)
const ofertaUuidMsg = (campo: string) => ({ message: `Debes seleccionar ${campo}.` })

export const OfertaCreateSchema = z.object({
  cursoId: z.string().uuid(ofertaUuidMsg('un curso')),
  gradoId: z.string().uuid(ofertaUuidMsg('un grado')),
  institutoId: z.string().uuid(ofertaUuidMsg('un instituto')),
  dia: z
    .string({ required_error: 'Debes seleccionar un día.' })
    .refine((value) => DIAS_SEMANA_SET.has(value as (typeof DIAS_SEMANA)[number]), {
      message: 'Debes seleccionar un día.',
    }),
  horaInicio: horaSchema('Debes ingresar la hora de inicio.'),
  horaFinalizacion: horaSchema('Debes ingresar la hora de finalización.'),
  fechaInicio: fechaRequerida('Debes ingresar la fecha de inicio.'),
  fechaFinalizacion: fechaRequerida('Debes ingresar la fecha de finalización.'),
  capacidad: z.coerce
    .number()
    .int({ message: 'Debes ingresar una capacidad válida.' })
    .min(1, { message: 'Debes ingresar una capacidad válida.' })
    .max(30, { message: '' }),
  status: z.enum(OFERTA_STATUS),
})

export const ofertaCursoSchema = OfertaCreateSchema
export type OfertaCreateInput = z.infer<typeof OfertaCreateSchema>

export const InscripcionCreateSchema = z.object({
  alumnoId: z.string().uuid({ message: 'Debes elegir un alumno.' }),
  ofertaId: z.string().uuid({ message: 'Debes elegir una oferta.' }),
  fechaInscripcion: z
    .string()
    .min(1, { message: 'Debes ingresar una fecha.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Debes ingresar una fecha.' }),
  estado: z
    .enum(['activo', 'inactivo'], {
      errorMap: () => ({ message: 'Debes elegir el estado.' }),
    })
    .default('activo'),
})

export const inscripcionSchema = InscripcionCreateSchema

/* ======================
 * Tipos inferidos
 * ====================== */
export type AlumnoCreateInput = z.infer<typeof alumnoCreateSchema>
export type AlumnoUpdateInput = z.infer<typeof alumnoUpdateSchema>
export type EncargadoInput = z.infer<typeof encargadoSchema>
export type EstablecimientoInput = z.infer<typeof establecimientoSchema>
export type NivelInput = z.infer<typeof nivelSchema>
export type GradoInput = z.infer<typeof gradoSchema>
export type VinculoAlumnoEncargadoInput = z.infer<typeof vinculoAlumnoEncargadoSchema>

export type SesionClaseCreateInput = z.infer<typeof sesionClaseCreateSchema>
export type SesionClaseRangeInput = z.infer<typeof sesionClaseRangeSchema>
export type AsistenciaCreateInput = z.infer<typeof asistenciaCreateSchema>
export type UnidadEvaluacionCreateInput = z.infer<typeof unidadEvaluacionCreateSchema>
export type CalificacionCreateInput = z.infer<typeof calificacionCreateSchema>
export type TarifaCursoCreateInput = z.infer<typeof tarifaCursoCreateSchema>
export type TarifaCursoUpdateInput = z.infer<typeof tarifaCursoUpdateSchema>
export type CargoCreateInput = z.infer<typeof cargoCreateSchema>
export type CargoUpdateInput = z.infer<typeof cargoUpdateSchema>
export type ReciboCreateInput = z.infer<typeof reciboCreateSchema>
export type DetalleReciboCreateInput = z.infer<typeof detalleReciboCreateSchema>

export type CursoCatalogoInput = z.infer<typeof cursoCatalogoSchema>
export type OfertaCursoInput = z.infer<typeof ofertaCursoSchema>
export type InscripcionCreateInput = z.infer<typeof InscripcionCreateSchema>
export type InscripcionInput = z.infer<typeof inscripcionSchema>
