import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { Suspense, useState } from 'react'

import environment from '@/config/environment'

// Lazy load DevtoolsPanel only in development
const DevtoolsPanel =
  environment.APP_ENV === 'development'
    ? React.lazy(() =>
        import('@tanstack/react-query-devtools').then((m) => ({
          default: m.ReactQueryDevtoolsPanel,
        }))
      )
    : () => null // Empty component if not in dev

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
    queries: {
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
    },
  },
})

interface ReactQueryProviderProps {
  children: React.ReactNode
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [isDevtoolsOpen, setIsDevtoolsOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {environment.APP_ENV === 'development' && (
        <div
          style={{
            bottom: '20px',
            position: 'fixed',
            right: '20px',
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setIsDevtoolsOpen(!isDevtoolsOpen)}
            style={{
              backgroundColor: '#ff4154',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '8px',
              padding: '8px 12px',
              width: '100%',
            }}
          >
            {isDevtoolsOpen ? 'Close' : 'Open'} React Query Devtools
          </button>
          {isDevtoolsOpen && (
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                height: '400px',
                width: '500px',
              }}
            >
              <Suspense fallback={<div>Loading Devtools…</div>}>
                <DevtoolsPanel onClose={() => setIsDevtoolsOpen(false)} />
              </Suspense>
            </div>
          )}
        </div>
      )}
    </QueryClientProvider>
  )
}

export { queryClient }
