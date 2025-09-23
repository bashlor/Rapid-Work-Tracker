import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import React from 'react'

import { TimerProvider } from '../../contexts/TimerContext'
import { WorkSessionProvider } from '../../contexts/WorkSessionContext'

// Créer un QueryClient pour les tests avec des options optimisées
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false, // Pas de retry en test
      },
      queries: {
        gcTime: 0, // Pas de cache en test (gcTime remplace cacheTime)
        retry: false, // Pas de retry en test
      },
    },
  })

// Interface pour les options de render personnalisées
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialWorkSessionData?: {
    selectedDate?: string
    sessions?: any[]
  }
  queryClient?: QueryClient
}

// Provider wrapper pour les tests
const AllProviders: React.FC<{
  children: React.ReactNode
  initialWorkSessionData?: {
    selectedDate?: string
    sessions?: any[]
  }
  queryClient?: QueryClient
}> = ({ children, initialWorkSessionData, queryClient }) => {
  const testQueryClient = queryClient || createTestQueryClient()

  return (
    <QueryClientProvider client={testQueryClient}>
      <TimerProvider>
        <WorkSessionProvider initialData={initialWorkSessionData}>{children}</WorkSessionProvider>
      </TimerProvider>
    </QueryClientProvider>
  )
}

// Méthode render personnalisée
export const customRender = (ui: React.ReactElement, options: CustomRenderOptions = {}) => {
  const { initialWorkSessionData, queryClient, ...renderOptions } = options

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllProviders initialWorkSessionData={initialWorkSessionData} queryClient={queryClient}>
      {children}
    </AllProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Réexporter tout depuis @testing-library/react
export * from '@testing-library/react'

// Remplacer la méthode render par défaut par notre version personnalisée
export { customRender as render }
