import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Shield, User as UserIcon, Lock } from 'lucide-react'

import RHFInput from '../../components/form/RHFInput'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { useAuthStore, type Role } from '../../store/auth'

const LOGO_SRC = '/logo.png'

const schema = z.object({
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof schema>

const ADMIN_PASS = 'admin123'
const USER_PASSWORDS = ['user123', 'user456', 'user789']

const isValidPassword = (password: string, role: Role): boolean => {
  if (role === 'admin') return password === ADMIN_PASS
  return USER_PASSWORDS.includes(password)
}

import GeometricBackground from '../../components/layout/GeometricBackground';

const LoginPage = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  })

  const handleLoginAs = (role: Role) => {
    const password = methods.getValues('password')
    if (!isValidPassword(password, role)) {
      notify({ title: 'Error de autenticación', description: 'Contraseña incorrecta', variant: 'error' })
      return
    }
    const email = role === 'admin' ? 'admin@example.com' : 'user@example.com'
    login(email, role)
    notify({ title: 'Ingreso exitoso', description: `Sesión iniciada como ${role}`, variant: 'success' })
    navigate('/', { replace: true })
  }

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-white to-pink-100 p-4">
      <GeometricBackground />
      <Card className="w-full max-w-md backdrop-blur-sm supports-[backdrop-filter]:bg-white/60 z-10 rounded-2xl shadow-xl">
        <div className="p-8">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md ring-1 ring-gray-200/50">
              <img
                src={LOGO_SRC}
                alt="Logo de la academia"
                className="h-20 w-20 rounded-2xl object-contain"
                draggable={false}
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2E2E2E]">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-gray-500">Ingresa la contraseña y elige un rol para entrar.</p>
          </header>

          {/* Formulario */}
          <FormProvider {...methods}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="relative group">
                  <div className="[&>input]:pl-10">
                    <RHFInput<LoginFormValues>
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="peer"
                    />
                  </div>
                  <span
                    className={`
                      pointer-events-none absolute inset-y-0 left-3.5 flex items-center
                      transition-opacity opacity-50 peer-focus:opacity-0
                      peer-[:not(:placeholder-shown)]:opacity-0 group-focus-within:opacity-0
                    `}
                    aria-hidden="true"
                  >
                    <Lock className="h-5 w-5 text-gray-400" />
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-400">Para uso interno. No compartas tus credenciales.</p>
              </div>

              {/* Botones de rol */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="danger"
                  className="h-12 w-full transform rounded-xl shadow-lg transition-transform hover:-translate-y-1"
                  onClick={() => handleLoginAs('admin')}
                  aria-label="Entrar como admin"
                >
                  <Shield className="mr-2 h-5 w-5 text-white" />
                  Entrar como admin
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-12 w-full transform rounded-xl shadow-sm transition-transform hover:-translate-y-0.5"
                  onClick={() => handleLoginAs('user')}
                  aria-label="Entrar como usuario"
                >
                  <UserIcon className="mr-2 h-5 w-5 text-gray-500" />
                  Entrar como user
                </Button>
              </div>
            </form>
          </FormProvider>

          {/* Pie */}
          <footer className="mt-8">
            <div className="rounded-xl border border-dashed border-gray-200/80 bg-white/50 p-4 text-center text-xs text-gray-500">
              ¿Problemas para ingresar? Contacta al administrador del sistema.
            </div>
          </footer>
        </div>
      </Card>
    </div>
  )
}


export default LoginPage
