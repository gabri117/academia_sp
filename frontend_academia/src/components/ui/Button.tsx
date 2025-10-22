import { clsx } from 'clsx'
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

import Spinner from './Spinner'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-xs gap-2',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-3',
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 ' +
    'shadow-[0_10px_24px_-12px_rgba(0,102,204,0.45)] hover:shadow-[0_18px_36px_-14px_rgba(0,102,204,0.55)] ' +
    'border border-transparent',

  secondary:
    'bg-sky-100 text-sky-600 border border-sky-200 ' +
    'hover:bg-sky-200 hover:text-sky-700 ' +
    'shadow-[0_8px_20px_-14px_rgba(14,165,233,0.25)]',

  ghost:
    'bg-transparent text-gray-700 border border-transparent ' +
    'hover:bg-sky-100 hover:text-sky-600',

  danger:
    'bg-red-500 text-white hover:bg-red-600 ' +
    'shadow-[0_10px_24px_-12px_rgba(225,29,72,0.45)] border border-transparent',

  success:
    'bg-green-500 text-white hover:bg-green-600 ' +
    'shadow-[0_10px_24px_-12px_rgba(22,163,74,0.45)] border border-transparent',

  warning:
    'bg-yellow-500 text-white hover:bg-yellow-600 ' +
    'shadow-[0_10px_24px_-12px_rgba(234,179,8,0.45)] border border-transparent',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, children, variant = 'primary', size = 'md', isLoading = false, disabled, type, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type ?? 'button'} // 👈 botón “seguro” por defecto
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-semibold',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'active:translate-y-[1px]',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={disabled ?? isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'

export default Button