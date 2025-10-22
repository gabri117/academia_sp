import { cls } from '@/components/ui/stylekit'
export default function BadgeEstado({ value }: { value?: string | null }) {
  const e = (value ?? '').toLowerCase()
  const on = e === 'activo'
  return (
    <span className={`${cls.badgeBase} ${on ? cls.badgeActivo : cls.badgeInactivo}`}>
      {e ? e[0].toUpperCase() + e.slice(1) : '—'}
    </span>
  )
}
