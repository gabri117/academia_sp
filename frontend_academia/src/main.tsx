import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import './styles/select-fix.css'
import './styles/datepicker-fix.css'
import './styles/geometric-animations.css'
import App from './App.tsx'

const bootstrap = async () => {
  if (import.meta.env.VITE_ENABLE_MSW === 'false') {
    const { enableMocking } = await import('./mocks/browser')
    await enableMocking()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()

