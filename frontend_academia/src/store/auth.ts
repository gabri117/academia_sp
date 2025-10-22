import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'admin' | 'user'

export type AuthUser = {
  email: string
}

type AuthState = {
  user: AuthUser | null
  role: Role | null
  isAuthenticated: boolean
  login: (email: string, asRole?: Role) => void
  logout: () => void
}

const getRoleFromEmail = (email: string): Role =>
  email.toLowerCase().includes('admin') ? 'admin' : 'user'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      login: (email, asRole) =>
        set({
          user: { email },
          role: asRole ?? getRoleFromEmail(email),
          isAuthenticated: true,
        }),
      logout: () => set({ user: null, role: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)