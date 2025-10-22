import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
  actions?: ReactNode
  color?: {
    bg: string
    border: string
  }
  collapsible?: boolean
  isCollapsed?: boolean
  onToggle?: () => void
}

const Card = ({
  className,
  children,
  title,
  description,
  actions,
  color,
  collapsible = false,
  isCollapsed = false,
  onToggle,
  ...props
}: CardProps) => {
  const renderHeading = () => (
    <div>
      {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  )

  const handleToggle = () => {
    if (collapsible && onToggle) {
      onToggle()
    }
  }

  const headerContent = collapsible ? (
    <button
      type="button"
      onClick={handleToggle}
      className="flex flex-1 items-start gap-3 text-left"
      aria-expanded={!isCollapsed}
    >
      <span
        className={clsx(
          'mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white transition-transform duration-200',
          isCollapsed ? '' : 'rotate-180',
        )}
      >
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </span>
      {renderHeading()}
    </button>
  ) : (
    <div className="flex-1">{renderHeading()}</div>
  )

  return (
    <section
      className={clsx(
        'rounded-xl border shadow-lg shadow-zinc-900/5 backdrop-blur-sm transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl',
        color ? `${color.bg} ${color.border}` : 'bg-white/70 border-border',
        className,
      )}
      {...props}
    >
      {(title || description || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-border p-6">
          {headerContent}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {(!collapsible || !isCollapsed) && <div className="p-6 text-gray-700">{children}</div>}
    </section>
  )
}

export default Card
