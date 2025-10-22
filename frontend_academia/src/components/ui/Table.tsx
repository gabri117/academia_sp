import { clsx } from 'clsx'
import type { ReactNode } from 'react'

import Pagination from './Pagination'
import type { PaginationMeta } from './Pagination'

type TableDensity = 'compact' | 'default' | 'comfortable'

export type TableColumn<T> = {
  key: keyof T
  header: string
  /**
   * Clase heredada (se aplica en header y celdas).
   * De preferencia usa headerClassName / cellClassName.
   */
  className?: string
  headerClassName?: string
  cellClassName?: string
  render?: (item: T) => ReactNode
}

type TableProps<T> = {
  data: T[]
  columns: TableColumn<T>[]
  renderActions?: (item: T) => ReactNode
  /** AHORA admite string o ReactNode */
  emptyMessage?: string | ReactNode
  getRowKey?: (item: T, index: number) => React.Key
  className?: string
  classNameHeader?: string
  classNameRow?: string
  density?: TableDensity
  pagination?: {
    meta: PaginationMeta
    onPageChange?: (page: number) => void
    onPageSizeChange?: (size: number) => void
    pageSizeOptions?: number[]
    isLoading?: boolean
  }
}

const densityConfig: Record<TableDensity, { header: string; cell: string }> = {
  comfortable: { header: 'px-5 py-4', cell: 'px-5 py-4' },
  default: { header: 'px-4 py-3', cell: 'px-4 py-3' },
  compact: { header: 'px-3 py-2', cell: 'px-3 py-2' },
}

const Table = <T extends Record<string, unknown>>({
  data,
  columns,
  renderActions,
  emptyMessage = 'No hay registros para mostrar.',
  getRowKey,
  className,
  classNameHeader,
  classNameRow,
  density = 'default',
  pagination,
}: TableProps<T>) => {
  const containerClassName = clsx('space-y-4', className)
  const { header: headerPadding, cell: cellPadding } =
    densityConfig[density] ?? densityConfig.default

  if (!data.length) {
    return (
      <div className={containerClassName}>
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-gray-600">
          {/* Puede ser texto o JSX */}
          {emptyMessage}
        </div>
        {pagination && (
          <Pagination
            meta={pagination.meta}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
            pageSizeOptions={pagination.pageSizeOptions}
            isLoading={pagination.isLoading}
          />
        )}
      </div>
    )
  }

  return (
    <div className={containerClassName}>
      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    scope="col"
                    className={clsx(
                      headerPadding,
                      'text-left text-[13px] font-semibold uppercase tracking-wide text-gray-600',
                      column.className,
                      column.headerClassName,
                      classNameHeader,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
                {renderActions && (
                  <th
                    className={clsx(
                      headerPadding,
                      'text-right text-[13px] font-semibold uppercase tracking-wide text-gray-600',
                      classNameHeader,
                    )}
                  >
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {data.map((item, index) => (
                <tr
                  key={getRowKey?.(item, index) ?? index}
                  className={clsx('hover:bg-gray-50/70', classNameRow)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={clsx(
                        cellPadding,
                        'align-top',
                        column.className,
                        column.cellClassName,
                      )}
                    >
                      {column.render ? column.render(item) : String(item[column.key] ?? '')}
                    </td>
                  ))}
                  {renderActions && (
                    <td className={clsx(cellPadding, 'text-right')}>
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <Pagination
          meta={pagination.meta}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          pageSizeOptions={pagination.pageSizeOptions}
          isLoading={pagination.isLoading}
        />
      )}
    </div>
  )
}

export default Table
export type { TableDensity }