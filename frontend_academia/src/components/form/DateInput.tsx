import { clsx } from 'clsx'
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

type DateInputProps = ComponentPropsWithoutRef<'input'> & {
  label?: string
  error?: string
  hint?: string
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name

    return (
      <label className="flex w-full flex-col gap-1 text-sm text-gray-700" htmlFor={inputId}>
        {label && <span className="font-medium text-gray-900">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          type="date"
          className={clsx(
            'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
            className,
          )}
          {...props}
        />
        {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </label>
    )
  },
)

DateInput.displayName = 'DateInput'

export default DateInput