// src/components/layout/Sidebar.tsx
import { clsx } from 'clsx'
import { NavLink } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../store/auth'
import type { Role } from '../../store/auth'
import {
  Home, Users, UserSquare2, Contact2, Layers3, Grid3X3, BookOpen, Building2,
  SquarePen, CalendarClock, ClipboardList, ReceiptText, BarChart3,
  BadgeDollarSign, Banknote, GraduationCap
} from 'lucide-react'


const LOGO_SRC = '/logo.png'


type SidebarItem = {
  label: string
  to: string
  roles?: Role[]
  icon?: React.ComponentType<{ size?: number; className?: string }>
}
type SidebarSection = { title: string; items: SidebarItem[] }

const sections: SidebarSection[] = [
  { title: 'General', items: [{ label: 'Dashboard', to: '/', icon: Home }] },
  {
    title: 'Personas',
    items: [
      { label: 'Alumnos', to: '/alumnos', icon: Users },
      { label: 'Vínculos alumno-encargado', to: '/alumnos/vinculos', icon: UserSquare2 },
      { label: 'Encargados', to: '/encargados', icon: Contact2 },
    ],
  },
  {
    title: 'Estructura académica',
    items: [
      { label: 'Niveles', to: '/niveles', icon: Layers3 },
      { label: 'Grados', to: '/grados', icon: Grid3X3 },
    ],
  },
  {
    title: 'Catálogo & Ofertas',
    items: [
      { label: 'Establecimientos', to: '/establecimientos', icon: Building2 },
      { label: 'Cursos', to: '/cursos', icon: BookOpen },
      { label: 'Ofertas', to: '/ofertas', icon: SquarePen },
      { label: 'Inscripciones', to: '/inscripciones', icon: ClipboardList },
    ],
  },


  {
    title: 'Pagos y Finanzas',
    items: [
      { label: 'Tarifas', to: '/pagos/tarifas', icon: BadgeDollarSign }, 
      { label: 'Cargos', to: '/pagos/cargos', icon: Banknote },         
      { label: 'Recibos', to: '/pagos/recibos', icon: ReceiptText },
      { label: 'Reportes', to: '/reportes', icon: BarChart3 },
    ],
  },
]

const SIDEBAR_KEY = 'ui:sidebar-collapsed'

const Sidebar = () => {
  const role = useAuthStore((s) => s.role)

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const raw = localStorage.getItem(SIDEBAR_KEY)
    return raw ? raw === '1' : false
  })

  // Toggle desde Topbar (evento 'sidebar-toggle')
  useEffect(() => {
    const handler = () => setCollapsed((v) => !v)
    window.addEventListener('sidebar-toggle', handler as any)
    return () => window.removeEventListener('sidebar-toggle', handler as any)
  }, [])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const widthClass = collapsed ? 'w-20' : 'w-64'

  const visibleSections = useMemo(
    () =>
      sections.map((s) => ({
        ...s,
        items: s.items.filter((item) =>
          item.roles ? (role ? item.roles.includes(role) : false) : true
        ),
      })),
    [role]
  )

  return (
    <>
      {/* Bubble fijo y flotante — visible SOLO cuando está colapsado */}
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expandir menú"
          title="Expandir menú"
          className={[
            'fixed z-50',
            // un poco a la derecha para no tapar
            'left-[96px] top-6 -translate-x-1/2',
            // tamaño contenedor 96x96
            'flex h-24 w-24 items-center justify-center rounded-full',
            'bg-white ring-1 ring-[#e6eefc] shadow-[0_14px_38px_-12px_rgba(40,99,240,0.38)]',
            'transition hover:scale-[1.03] active:scale-95'
          ].join(' ')}
        >
          <img
            src={LOGO_SRC}
            alt="Logo"
            className="h-100 w-100 rounded-full object-contain p-1.5"
          />
        </button>
      )}

      <aside
        className={clsx(
          'relative group/sidebar flex h-full flex-col gap-4 overflow-y-auto border-r border-[#e8edf5] bg-white/95 px-3 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-white/95',
          'transition-[width] duration-300 ease-in-out shadow-[4px_0_32px_-12px_rgba(40,99,240,0.12)]',
          widthClass
        )}
      >
        {/* Header / Brand (solo expandido) */}
        {!collapsed && (
          <div className="flex items-center justify-between rounded-xl border border-[#e6eefc] bg-[linear-gradient(135deg,#FFFFFF,#F9FAFB)] px-3 py-4 shadow-[0_8px_32px_rgba(40,99,240,0.12)]">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={LOGO_SRC}
                alt="Logo"
                className="h-12 w-12 rounded-2xl object-contain p-1.5 shadow-[0_6px_16px_rgba(40,99,240,0.20)] ring-1 ring-[#e6eefc] bg-white"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2863f0]">
                  Academia
                </span>
                <h1 className="mt-0.5 truncate text-[16px] font-bold leading-5 text-[#1f2b3e]">
                  Panel de gestión
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded-md border border-[#e6eefc] bg-white px-2 py-1 text-xs text-[#2863f0] hover:bg-[#f5f8ff]"
              aria-label="Contraer sidebar"
              title="Contraer"
            >
              ⟨⟨
            </button>
          </div>
        )}

        {/* Nav */}
        <nav
          className={clsx(
            'flex-1 space-y-5 text-sm',
            // empuja el listado cuando está colapsado para que el bubble no tape
            collapsed && 'pt-28'
          )}
        >
          {visibleSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-[#7a8696]">
                  {section.title}
                </p>
              )}
              <ul className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon ?? SquarePen
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          clsx(
                            'group/nav relative flex items-center rounded-lg font-medium transition',
                            collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2',
                            'hover:bg-sky-100 hover:text-sky-600',
                            isActive
                              ? 'bg-sky-100 text-sky-600 shadow-[inset_3px_0_0_0_#0ea5e9]'
                              : 'text-gray-600 shadow-[inset_3px_0_0_0_transparent]'
                          )
                        }
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon
                          size={collapsed ? 24 : 18}
                          className={clsx(
                            'shrink-0',
                            collapsed ? '' : 'mr-2',
                            'text-gray-500 group-hover/nav:text-sky-500'
                          )}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
