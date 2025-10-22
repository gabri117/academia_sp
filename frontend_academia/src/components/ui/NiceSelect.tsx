import React, { useEffect, useMemo, useRef, useState } from 'react'

type Option = {
  value: string
  label: string
  helper?: string | null
  disabled?: boolean
}

export type NiceSelectProps = {
  label?: string
  placeholder?: string
  value: string
  onChange: (val: string) => void
  options: Option[]
  header?: string
  className?: string
  disabled?: boolean
  error?: string
}

function cx(...cn: Array<string | false | null | undefined>) {
  return cn.filter(Boolean).join(' ')
}

const NiceSelect: React.FC<NiceSelectProps> = ({
  label,
  placeholder = 'Selecciona una opción',
  value,
  onChange,
  options,
  header,
  className,
  disabled,
  error,
}) => {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const selected = useMemo(() => options.find(o => o.value === value), [options, value])
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const i = options.findIndex(o => o.value === value && !o.disabled)
    return i >= 0 ? i : 0
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!listRef.current && !btnRef.current) return
      const t = e.target as Node
      const inside = listRef.current?.contains(t) || btnRef.current?.contains(t)
      if (!inside) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLDivElement>(`[data-index="${activeIndex}"]`)
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ')) {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (!open) return
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => {
        let next = i + 1
        while (next < options.length && options[next].disabled) next++
        return next < options.length ? next : i
      })
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => {
        let prev = i - 1
        while (prev >= 0 && options[prev].disabled) prev--
        return prev >= 0 ? prev : i
      })
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const opt = options[activeIndex]
      if (opt && !opt.disabled) {
        onChange(opt.value)
        setOpen(false)
      }
    }
  }

  const baseInput = cx(
    'w-full min-h-[52px] rounded-2xl border px-4 py-3.5 text-[16px]',
    'border-[#d5e5fb] bg-white text-[#1f3c63] placeholder:text-gray-400',
    'shadow-[0_10px_24px_-20px_rgba(0,68,140,0.25)]',
    'focus:outline-none focus:ring-2 focus:ring-[rgba(51,133,255,0.28)] focus:border-[#3385ff]',
    disabled && 'opacity-60 cursor-not-allowed',
    className,
  )

  return (
    <div className="relative">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <button
        ref={btnRef}
        type="button"
        className={cx(baseInput, 'flex items-center justify-between')}
        onClick={() => !disabled && setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cx(!selected && 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={cx('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
          viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {open && !disabled && (
        <div
          ref={listRef}
          className={cx(
            'absolute z-50 mt-2 w-full overflow-hidden rounded-2xl',
            'border border-[#d5e5fb] bg-white/95 backdrop-blur',
            'shadow-[0_22px_48px_-28px_rgba(0,68,140,0.25)]',
          )}
          role="listbox"
          aria-activedescendant={String(activeIndex)}
        >
          {header && (
            <div className="border-b border-[#eef5ff] bg-[#f6faff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#3d78d8]">
              {header}
            </div>
          )}
          <div className="max-h-64 overflow-auto py-1">
            {options.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-500">Sin opciones</div>
            )}
            {options.map((opt, i) => {
              const isSelected = opt.value === value
              const isActive = i === activeIndex
              return (
                <div
                  key={opt.value || i}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  className={cx(
                    'cursor-pointer px-4 py-3 text-[15px] transition-colors',
                    'hover:bg-[#f1f6ff]',
                    isActive && 'bg-[#eef5ff]',
                    opt.disabled && 'opacity-40 cursor-not-allowed',
                  )}
                  onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                  onClick={() => {
                    if (opt.disabled) return
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className={cx('leading-5', isSelected ? 'font-semibold text-[#1f3c63]' : 'text-[#1f3c63]')}>
                        {opt.label}
                      </div>
                      {opt.helper && (
                        <div className="text-xs text-[#6b7a90]">
                          {opt.helper.split('\n').map((line, idx, arr) => (
                            <React.Fragment key={`${opt.value}-helper-${idx}`}>
                              {line}
                              {idx < arr.length - 1 ? <br /> : null}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <svg className="mt-0.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-7.2 7.2a1 1 0 01-1.415 0l-3.2-3.2a1 1 0 111.415-1.415l2.492 2.492 6.493-6.493a1 1 0 011.415 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default NiceSelect
