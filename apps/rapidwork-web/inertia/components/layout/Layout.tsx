import { usePage } from '@inertiajs/react'
import React, { useState } from 'react'

import ErrorBoundary from '@/components/ErrorBoundary'
import AppHeader from '@/components/time-tracking/SharedComponents/AppHeader'
import AppSidebar from '@/components/time-tracking/SharedComponents/AppSidebar'
import { TimerProvider } from '@/contexts/TimerContext'
import { WorkSessionProvider } from '@/contexts/WorkSessionContext'
import { useNotification } from '@/hooks/useNotification'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const page = usePage()
  const currentPath = page.url.split('?')[0]

  // Initialise le système de notifications pour toute l'app
  useNotification()

  // Détection si on est sur la page add_work_session OU sessions OU home (pour le header qui utilise le contexte)
  const isWorkSessionPage =
    currentPath.includes('/add_work_session') ||
    currentPath.includes('/sessions') ||
    currentPath.includes('/home')

  // Extraire les données préchargées pour les sessions si disponibles
  const pageProps = page.props as any
  const initialData =
    (currentPath.includes('/add_work_session') || currentPath.includes('/sessions')) &&
    pageProps.sessions
      ? {
          selectedDate: pageProps.selectedDate,
          sessions: pageProps.sessions || [],
        }
      : undefined

  const content = (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar structurelle */}
      <div
        className={`bg-white h-screen border-r border-border transition-all duration-300 shadow-sm ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
        <div className="sticky top-0 z-10">
          <AppHeader />
        </div>
        <main className="flex-1 overflow-auto p-8 md:p-10 lg:p-12 xl:p-16">
          <ErrorBoundary>
            <div className="max-w-7xl mx-auto">{children}</div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )

  return (
    <TimerProvider>
      {isWorkSessionPage ? (
        <WorkSessionProvider initialData={initialData}>{content}</WorkSessionProvider>
      ) : (
        content
      )}
    </TimerProvider>
  )
}
