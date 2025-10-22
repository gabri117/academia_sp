import axios, { AxiosError } from 'axios'

export type ApiError = {
  status: number
  message: string
  details?: unknown
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string; details?: unknown }>) => {
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      message: error.response?.data?.message ?? error.message,
      details: error.response?.data?.details,
    }

    return Promise.reject(apiError)
  },
)

export const isApiError = (value: unknown): value is ApiError =>
  typeof value === 'object' && value !== null && 'status' in value && 'message' in value

export default apiClient