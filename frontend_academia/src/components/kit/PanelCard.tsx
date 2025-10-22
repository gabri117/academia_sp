import { cls } from '@/components/ui/stylekit'
export default function PanelCard(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props
  return <div className={`${cls.panelCard} ${className}`} {...rest} />
}
