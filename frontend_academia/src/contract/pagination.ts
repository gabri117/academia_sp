export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface PageableQuery {
  page?: number
  size?: number
  sort?: string | string[]
}

export const toPageParams = (query?: PageableQuery): Record<string, number | string | string[]> => {
  if (!query) {
    return {}
  }

  const params: Record<string, number | string | string[]> = {}
  if (typeof query.page === 'number') {
    params.page = query.page
  }
  if (typeof query.size === 'number') {
    params.size = query.size
  }
  if (typeof query.sort === 'string' || Array.isArray(query.sort)) {
    params.sort = query.sort
  }

  return params
}

export type PageQueryParams = PageableQuery
export const sanitizePageParams = toPageParams
