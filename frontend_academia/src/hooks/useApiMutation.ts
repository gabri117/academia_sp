import { useMutation } from '@tanstack/react-query'
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query'

import type { ApiError } from '../api/types'

export const useApiMutation = <TData, TVariables, TContext = unknown>(
  options: UseMutationOptions<TData, ApiError, TVariables, TContext>,
): UseMutationResult<TData, ApiError, TVariables, TContext> => {
  return useMutation({
    retry: 1,
    ...options,
  })
}
