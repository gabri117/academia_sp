import { CircleUserRound, LogOut, Menu } from 'lucide-react'
import Button from '../ui/Button'
import { useAuthStore } from '../../store/auth'

const getInitialsFromEmail = (email?: string | null) => {
  if (!email) return 'U'
  const name = email.split('@')[0] || ''
  const parts = name.replace(/[._-]+/g, ' ').trim().split(' ')
  const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
  return initials || 'U'
}

const Topbar = () => {
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const logout = useAuthStore((state) => state.logout)

  const initials = getInitialsFromEmail(user?.email)

  const toggleSidebar = () => {
    // dispara un evento que el Sidebar escucha
    window.dispatchEvent(new Event('sidebar-toggle'))
  }

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar la sesión?')) {
      logout()
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e8edf5] bg-white/90 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-[0_10px_30px_-24px_rgba(31,60,99,0.35)]">
      <div className="flex min-w-0 items-center gap-3">
        {/* Botón hamburguesa */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 shadow-sm"
          aria-label="Alternar menú"
          title="Contraer/expandir menú"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-[#1f2b3e]">
            Panel de Control
          </h2>
          <p className="truncate text-sm text-[#667085]">
            Rol actual: <span className="font-medium">{role ?? 'Invitado'}</span>
          </p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e6eefc] bg-[#f6f9ff] px-3 py-1 text-sm text-[#1f3c63] shadow-[0_10px_24px_-22px_rgba(31,60,99,0.35)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2863f0,#5ea2ff)] text-xs font-bold text-white">
              {initials}
            </span>
            <span className="hidden sm:inline">{role ?? 'user'}</span>
          </span>

          <Button
            variant="secondary"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut size={16} className="text-gray-500" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      )}
    </header>
  )
}

export default Topbar
