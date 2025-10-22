import { clsx } from 'clsx'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { X } from 'lucide-react'

import Button from './Button'

type ToastVariant = 'info' | 'success' | 'error' | 'warning'

type ToastItem = {
  id: number
  title: string
  description?: string
  variant?: ToastVariant
  dismissible?: boolean
}

type ToastContextValue = {
  notify: (toast: Omit<ToastItem, 'id'>) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const variantClasses: Record<ToastVariant, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = Date.now() + Math.random()
      const item: ToastItem = {
        id,
        variant: 'info',
        dismissible: true,
        ...toast,
      }

      setToasts((current) => [...current, item])

      if (typeof window !== 'undefined' && item.dismissible !== false) {
        window.setTimeout(() => dismiss(id), 3500)
      }
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={clsx(
                  'flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg',
                  variantClasses[toast.variant ?? 'info'],
                )}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description && <p className="mt-1 text-sm opacity-90">{toast.description}</p>}
                </div>
                {toast.dismissible !== false && (
                  <Button variant="ghost" size="sm" onClick={() => dismiss(toast.id)} aria-label="Cerrar aviso">
                    <X size={16} className="text-gray-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe ser usado dentro de ToastProvider')
  }
  return context
}