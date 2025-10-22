import { clsx } from 'clsx'
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

export type InputProps = ComponentPropsWithoutRef<'input'> & {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, type, style, ...props }, ref) => {
    const inputId = id ?? props.name
    const colorClass =
      type === 'date' || type === 'time' ? 'text-black' : 'text-gray-900'
    const mergedStyle =
      type === 'date' || type === 'time' ? { ...style, colorScheme: 'light' } : style

    return (
      <label className="flex w-full flex-col gap-1 text-sm text-gray-700" htmlFor={inputId}>
        {label && <span className="font-medium text-gray-900">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-md border border-border bg-white px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40',
            colorClass,
            error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
            className,
          )}
          type={type}
          style={mergedStyle}
          {...props}
        />
        {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </label>
    )
  },
)

Input.displayName = 'Input'

export default Input
