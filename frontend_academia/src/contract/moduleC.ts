import type { UUID } from './moduleA'

export const DATE_FORMAT = 'yyyy-MM-dd' as const
export const TIME_FORMAT = 'HH:mm:ss' as const
export const MIN_DECIMAL = '0.00' as const
//Coment3
export const MES = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
] as const
export type Mes = (typeof MES)[number]

export const CARGO_ESTADO = ['PENDIENTE', 'CANCELADO'] as const
export type CargoEstado = (typeof CARGO_ESTADO)[number]

export const RECIBO_ESTADO = ['EMITIDO', 'ANULADO'] as const
export type ReciboEstado = (typeof RECIBO_ESTADO)[number]

export interface SesionClase extends Record<string, unknown> {
  sessionId: UUID
  ofertaId: UUID
  /**
   * Fecha de la sesión en formato yyyy-MM-dd.
   */
  fecha: string
}

export type SesionClaseCreateDTO = Pick<SesionClase, 'ofertaId' | 'fecha'>

export interface SesionClaseRangeQuery {
  /**
   * Fecha inicial inclusiva (yyyy-MM-dd).
   */
  desde?: string
  /**
   * Fecha final inclusiva (yyyy-MM-dd).
   */
  hasta?: string
}

export interface SesionClaseIdentifier {
  sessionId: UUID
}

export interface Asistencia {
  sessionId: UUID
  inscripcionId: UUID
  presente: boolean
}

export type AsistenciaCreateDTO = Asistencia

export interface AsistenciaCompositeKey {
  sessionId: UUID
  inscripcionId: UUID
}

export interface UnidadEvaluacion extends Record<string, unknown> {
  evaluacionId: UUID
  ofertaId: UUID
  /**
   * Nombre de la unidad (máx. 25 caracteres).
   */
  nombre: string
}

export type UnidadEvaluacionCreateDTO = Pick<UnidadEvaluacion, 'ofertaId' | 'nombre'>

export interface UnidadEvaluacionIdentifier {
  evaluacionId: UUID
}

export interface Calificacion {
  inscripcionId: UUID
  evaluacionId: UUID
  /**
   * Nota numérica con al menos dos decimales.
   */
  nota: number
  observaciones?: string | null
}

export type CalificacionCreateDTO = Calificacion

export interface CalificacionCompositeKey {
  inscripcionId: UUID
  evaluacionId: UUID
}

export interface TarifaCurso extends Record<string, unknown> {
  tarifaId: UUID
  ofertaId: UUID
  montoInscripcion: number
  montoMensualidad: number
}

export type TarifaCursoCreateDTO = Pick<TarifaCurso, 'ofertaId' | 'montoInscripcion' | 'montoMensualidad'>
export type TarifaCursoUpdateDTO = Pick<TarifaCurso, 'ofertaId'> &
  Partial<Pick<TarifaCurso, 'montoInscripcion' | 'montoMensualidad'>>

export interface TarifaCursoIdentifier {
  tarifaId: UUID
}

export interface Cargo extends Record<string, unknown> {
  cargoId: UUID
  tarifaId: UUID
  periodoMes: Mes
  concepto: string
  monto: number
  estado: CargoEstado
}

export type CargoCreateDTO = Pick<Cargo, 'tarifaId' | 'periodoMes' | 'concepto' | 'monto'> &
  Partial<Pick<Cargo, 'estado'>>

export type CargoUpdateDTO = Partial<Pick<Cargo, 'periodoMes' | 'concepto' | 'monto' | 'estado'>>

export interface CargoIdentifier {
  cargoId: UUID
}

export interface Recibo extends Record<string, unknown> {
  reciboId: UUID
  alumnoId: UUID
  correlativoRecibo?: string | null
  /**
   * Fecha de emisión en formato yyyy-MM-dd.
   */
  fecha?: string | null
  total?: number | null
  estado: ReciboEstado
}

export type ReciboCreateDTO = Pick<Recibo, 'alumnoId'> &
  Partial<Pick<Recibo, 'correlativoRecibo' | 'fecha' | 'total' | 'estado'>>

export type ReciboUpdateDTO = Partial<Pick<Recibo, 'fecha' | 'total' | 'estado'>>

export interface ReciboIdentifier {
  reciboId: UUID
}

export interface ReciboOfertaDetalleDTO {
  ofertaId: UUID
  nombreOferta: string
  dia?: string | null
  horaInicio?: string | null
  horaFinalizacion?: string | null
  institutoId?: UUID | null
  institutoNombre?: string | null
  gradoNombre?: string | null
}

export interface ReciboConOfertasDTO {
  reciboId: UUID
  alumnoId: UUID
  correlativoRecibo?: string | null
  fecha?: string | null
  estado: ReciboEstado
  total?: number | null
  ofertas: ReciboOfertaDetalleDTO[]
}

export interface DetalleRecibo extends Record<string, unknown> {
  reciboId: UUID
  cargoId: UUID
  montoAplicado: number
}

export type DetalleReciboCreateDTO = DetalleRecibo

export interface DetalleReciboCompositeKey {
  reciboId: UUID
  cargoId: UUID
}

export interface EstadoCuentaPeriodo {
  periodo: Mes
  totalCargos: number
  totalPagos: number
  saldo: number
}

export interface EstadoCuenta {
  alumnoId: UUID
  periodos: EstadoCuentaPeriodo[]
  saldoTotal: number
}

export type { UUID }
