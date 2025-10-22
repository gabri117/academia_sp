import { useQuery } from '@tanstack/react-query'
import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

import type { ApiError } from '../api/types'

export const useApiQuery = <TQueryFnData, TData = TQueryFnData>(
  options: Omit<UseQueryOptions<TQueryFnData, ApiError, TData, QueryKey>, 'queryFn'> & {
    queryFn: () => Promise<TQueryFnData>
  },
): UseQueryResult<TData, ApiError> => {
  return useQuery({
    retry: 1,
    ...options,
  })
}
