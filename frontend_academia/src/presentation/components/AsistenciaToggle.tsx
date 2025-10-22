import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type AttendanceState = boolean | null

export type AsistenciaToggleProps = {
  value: AttendanceState
  onChange: (value: AttendanceState) => void
  disabled?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange' | 'type'>

const stateSequence: AttendanceState[] = [null, true, false]

const nextState = (current: AttendanceState): AttendanceState => {
  const index = stateSequence.findIndex((state) => state === current)
  const nextIndex = (index + 1) % stateSequence.length
  return stateSequence[nextIndex]
}

const stateLabel: Record<'unmarked' | 'present' | 'absent', string> = {
  unmarked: 'Sin marcar',
  present: 'Presente',
  absent: 'Ausente',
}

const stateClasses: Record<'unmarked' | 'present' | 'absent', string> = {
  unmarked: 'border-gray-300 bg-gray-100 text-gray-600',
  present: 'border-green-300 bg-green-100 text-green-800',
  absent: 'border-red-300 bg-red-100 text-red-800',
}

const resolveStateKey = (value: AttendanceState): keyof typeof stateLabel => {
  if (value === true) return 'present'
  if (value === false) return 'absent'
  return 'unmarked'
}

const AsistenciaToggle = ({
  value,
  onChange,
  disabled = false,
  className,
  ...buttonProps
}: AsistenciaToggleProps) => {
  const stateKey = resolveStateKey(value)

  const handleClick = () => {
    if (disabled) return
    const next = nextState(value)
    onChange(next)
  }

  return (
    <button
      type="button"
      className={clsx(
        'flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60 disabled:cursor-not-allowed disabled:opacity-60',
        stateClasses[stateKey],
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={value === true}
      aria-label={`Estado de asistencia: ${stateLabel[stateKey]}`}
      {...buttonProps}
    >
      <span
        className={clsx(
          'h-2.5 w-2.5 rounded-full',
          stateKey === 'present'
            ? 'bg-green-500'
            : stateKey === 'absent'
            ? 'bg-red-500'
            : 'bg-gray-400',
        )}
      />
      <span>{stateLabel[stateKey]}</span>
    </button>
  )
}

export default AsistenciaToggle

