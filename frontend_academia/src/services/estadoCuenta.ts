import { obtenerEstadoCuenta as apiObtenerEstadoCuenta } from '../api/client'
import type { UUID } from '../contract/moduleA'

export const obtenerEstadoCuenta = (alumnoId: UUID) => apiObtenerEstadoCuenta(alumnoId)
