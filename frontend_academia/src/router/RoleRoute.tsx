import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '../store/auth'
import type { Role } from '../store/auth'

const RoleRoute = ({ roles }: { roles: Role[] }) => {
  const role = useAuthStore((state) => state.role)

  if (!role || !roles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RoleRoute
