import { isAxiosError } from 'axios'

export * from '../contract/moduleA'
export * from '../contract/pagination'

export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

export const isApiErrorBody = (value: unknown): value is ApiErrorBody => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'timestamp' in value &&
    'status' in value &&
    'error' in value &&
    'message' in value &&
    'path' in value
  )
}

export class ApiError extends Error implements ApiErrorBody {
  readonly timestamp: string
  readonly status: number
  readonly error: string
  readonly path: string

  constructor(body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.timestamp = body.timestamp
    this.status = body.status
    this.error = body.error
    this.path = body.path
  }

  toJSON(): ApiErrorBody {
    return {
      timestamp: this.timestamp,
      status: this.status,
      error: this.error,
      message: this.message,
      path: this.path,
    }
  }
}

const buildFallback = (options?: Partial<ApiErrorBody>): ApiErrorBody => {
  const timestamp = options?.timestamp ?? new Date().toISOString()
  const status = options?.status ?? 0
  const error = options?.error ?? 'Unexpected Error'
  const message = options?.message ?? 'Ocurrio un error inesperado'
  const path = options?.path ?? ''
  return { timestamp, status, error, message, path }
}

export const normalizeApiError = (input: unknown, fallback?: Partial<ApiErrorBody>): ApiError => {
  if (isApiErrorBody(input)) {
    return new ApiError(input)
  }

  if (isAxiosError(input)) {
    const fallbackBody = buildFallback({
      status: input.response?.status ?? fallback?.status,
      message: input.message ?? fallback?.message,
      error: input.code ?? fallback?.error,
      path: input.config?.url ?? fallback?.path,
      timestamp: fallback?.timestamp,
    })

    if (isApiErrorBody(input.response?.data)) {
      return new ApiError(input.response!.data)
    }

    return new ApiError(fallbackBody)
  }

  const fallbackBody = buildFallback(fallback)
  return new ApiError(fallbackBody)
}

export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError
