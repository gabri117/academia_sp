import { QueryClientProvider } from '@tanstack/react-query'

import { ToastProvider } from './components/ui/Toast'
import { queryClient } from './lib/query'
import AppRouter from './router/AppRouter'

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </QueryClientProvider>
)

export default App
