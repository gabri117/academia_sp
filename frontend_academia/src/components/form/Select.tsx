import { clsx } from 'clsx'
import { forwardRef, useMemo, useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
//Coment2
type Option = {
  label: string
  value: string | number
}

type SelectProps = ComponentPropsWithoutRef<'select'> & {
  label?: string
  error?: string
  hint?: string
  options: Option[]
  placeholder?: string
  searchable?: boolean
  searchPlaceholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      className,
      id,
      options,
      placeholder,
      searchable = false,
      searchPlaceholder = 'Buscar...',
      ...props
    },
    ref,
  ) => {
    const selectId = id ?? props.name
    const [filter, setFilter] = useState('')

    const filteredOptions = useMemo(() => {
      if (!searchable) return options
      const term = filter.trim().toLowerCase()
      if (!term) return options
      return options.filter((option) => option.label.toLowerCase().includes(term))
    }, [filter, options, searchable])

    return (
      <label className="flex w-full flex-col gap-1 text-sm text-gray-700" htmlFor={selectId}>
        {label && <span className="font-medium text-gray-900">{label}</span>}
        {searchable && (
          <input
            type="text"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={searchPlaceholder}
            className={clsx(
              'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
            )}
          />
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {filteredOptions.length === 0 && searchable && filter.trim().length > 0 ? (
            <option value="" disabled>
              Sin resultados
            </option>
          ) : null}
          {filteredOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </label>
    )
  },
)

Select.displayName = 'Select'

export default Select
