import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import React, { useState } from 'react'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 4xx (client errors)
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        // Retry jusqu'à 3 fois pour les autres erreurs
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1, // Retry les mutations une seule fois
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
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
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
              <ReactQueryDevtoolsPanel onClose={() => setIsDevtoolsOpen(false)} />
            </div>
          )}
        </div>
      )}
    </QueryClientProvider>
  )
}

export { queryClient }
