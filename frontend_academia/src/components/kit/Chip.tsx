import { cls } from '@/components/ui/stylekit'
export function Chip({
  active,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button type="button" className={`${cls.chipBase} ${active ? cls.chipOn : cls.chipOff}`} {...rest}>
      {children}
    </button>
  )
}
