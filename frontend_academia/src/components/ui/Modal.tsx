import { clsx } from 'clsx'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import Button from './Button'

export type ModalProps = {
  isOpen: boolean
  title?: string
  description?: string
  onClose: () => void
  children: ReactNode
  actions?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
}

const Modal = ({ isOpen, onClose, title, description, children, actions, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
    return
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className={clsx('w-full rounded-lg bg-white shadow-xl', sizeClasses[size])} role="dialog" aria-modal>
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Cerrar">
            ?
          </Button>
        </div>
        <div className="p-6 text-gray-700">{children}</div>
        {actions && <div className="flex items-center justify-end gap-2 border-t border-border bg-gray-50 p-4">{actions}</div>}
      </div>
    </div>,
    document.body,
  )
}

export default Modal