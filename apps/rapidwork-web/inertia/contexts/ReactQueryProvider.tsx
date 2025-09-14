import environment from '@/config/environment'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useState, Suspense } from 'react'

console.log(environment)

// Lazy load DevtoolsPanel only in development
const DevtoolsPanel = environment.APP_ENV === 'development'
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then(m => ({
        default: m.ReactQueryDevtoolsPanel,
      })),
    )
  : () => null // Empty component if not in dev

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
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
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
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
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setIsDevtoolsOpen(!isDevtoolsOpen)}
            style={{
              backgroundColor: '#ff4154',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '8px',
              display: 'block',
              width: '100%',
            }}
          >
            {isDevtoolsOpen ? 'Close' : 'Open'} React Query Devtools
          </button>
          {isDevtoolsOpen && (
            <div
              style={{
                width: '500px',
                height: '400px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
