import { setupWorker } from 'msw/browser'

import { handlers } from '../../mocks/handlers'

export const mswWorker = setupWorker(...handlers)

export const enableMocking = async () => {
  if (typeof window === 'undefined') return
  await mswWorker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    onUnhandledRequest: 'bypass',
  })
}
