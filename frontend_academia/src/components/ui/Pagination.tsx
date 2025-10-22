import Button from './Button'
import type { Page } from '@/contract/pagination'

type PaginationMeta = Pick<Page<unknown>, 'number' | 'size' | 'totalElements' | 'totalPages'>

type PaginationProps = {
  meta: PaginationMeta
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  isLoading?: boolean
}

const DEFAULT_PAGE_SIZES = [10, 20, 50]

const Pagination = ({
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  isLoading = false,
}: PaginationProps) => {
  const currentPage = meta.number ?? 0
  const totalPages = meta.totalPages ?? 0
  const totalElements = meta.totalElements ?? 0
  const pageSize = meta.size ?? 0

  const isFirstPage = currentPage <= 0
  const isLastPage = totalPages === 0 || currentPage >= totalPages - 1

  const handlePrevious = () => {
    if (!onPageChange) return
    onPageChange(Math.max(currentPage - 1, 0))
  }

  const handleNext = () => {
    if (!onPageChange || totalPages === 0) return
    onPageChange(Math.min(currentPage + 1, totalPages - 1))
  }

  const from = totalElements === 0 ? 0 : currentPage * pageSize + 1
  const to = totalElements === 0 ? 0 : Math.min((currentPage + 1) * pageSize, totalElements)

  return (
    <div className="flex flex-col gap-4 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
      <span>
        Mostrando {from}-{to} de {totalElements}
      </span>
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
        {onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span>Tamano</span>
            <select
              className="rounded-md border border-border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              disabled={isLoading}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirstPage || isLoading || !onPageChange}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleNext}
            disabled={isLastPage || isLoading || !onPageChange}
          >
            Siguiente
          </Button>
        </div>
        <span className="text-xs text-gray-500">
          Pagina {totalPages === 0 ? 0 : currentPage + 1} de {totalPages}
        </span>
      </div>
    </div>
  )
}

export type { PaginationMeta }
export default Pagination