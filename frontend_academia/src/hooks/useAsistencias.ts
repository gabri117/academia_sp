import { useCallback, useEffect, useState } from 'react'

import { listAsistenciasPorSesion, registrarAsistencia } from '../api/client'
import { ApiError, normalizeApiError } from '../api/types'
import type { Asistencia, AsistenciaCreateDTO } from '../contract/moduleC'
//Coment5
type UseAsistenciasOptions = {
  sessionId?: string | null
  autoFetch?: boolean
}

type UseAsistenciasReturn = {
  asistencias: Asistencia[]
  loading: boolean
  error: ApiError | null
  registrarAsistenciasBatch: (payload: AsistenciaCreateDTO[]) => Promise<void>
}

/**
 * Gestiona el ciclo de vida de las asistencias (listar y registrar en lote) para modulo C.
 * Encapsula el estado de peticiones y expone helpers listos para usar en las vistas.
 */
export const useAsistencias = (
  { sessionId, autoFetch = true }: UseAsistenciasOptions = {},
): UseAsistenciasReturn => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  /**
   * Consulta las asistencias registradas para una sesion especifica.
   */
  const listarAsistencias = useCallback(
    async (targetSessionId: string) => {
      setLoading(true)
      setError(null)

      try {
        const data = await listAsistenciasPorSesion(targetSessionId)
        setAsistencias(data)
      } catch (err) {
        const apiError = normalizeApiError(err)
        setError(apiError)
        throw apiError
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  /**
   * Registra asistencias en lote recorriendo cada item.
   * Tras una insercion exitosa refresca la lista si se conoce la sesion.
   */
  const registrarAsistenciasBatch = useCallback(
    async (payload: AsistenciaCreateDTO[]) => {
      if (payload.length === 0) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        for (const item of payload) {
          await registrarAsistencia(item)
        }

        if (sessionId) {
          await listarAsistencias(sessionId)
        }
      } catch (err) {
        const apiError = normalizeApiError(err)
        setError(apiError)
        throw apiError
      } finally {
        setLoading(false)
      }
    },
    [listarAsistencias, sessionId],
  )

  useEffect(() => {
    if (!autoFetch || !sessionId) {
      if (!sessionId) {
        setAsistencias([])
      }
      return
    }

    listarAsistencias(sessionId).catch(() => {
      // El error ya se guarda en estado, no necesitamos accion extra aqui.
    })
  }, [autoFetch, sessionId, listarAsistencias])

  return {
    asistencias,
    loading,
    error,
    registrarAsistenciasBatch,
  }
}

export default useAsistencias

