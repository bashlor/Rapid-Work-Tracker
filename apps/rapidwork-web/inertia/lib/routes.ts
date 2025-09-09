import { Calendar, Database, Home, Timer } from 'lucide-react'

export interface RouteConfig {
  headerTab?: string
  href: string
  icon: any
  key: string
  label: string
  order?: number
  showInHeader?: boolean
  showInSidebar?: boolean
  title: string
}

/**
 * Configuration centralisée des routes
 *
 * Ordre recommandé :
 * - 1-10 : Navigation principale (Saisie, Chronomètre, etc.)
 * - 11-20 : Vues de consultation (Données, Stats, etc.)
 * - 21+ : Fonctionnalités avancées (Export, Options, etc.)
 */
export const routes: RouteConfig[] = [
  {
    href: '/app/home',
    icon: Home,
    key: 'home',
    label: 'Accueil',
    order: 1,
    showInHeader: false,
    showInSidebar: true,
    title: 'Accueil',
  },
  {
    headerTab: 'Sessions',
    href: '/app/sessions',
    icon: Calendar,
    key: 'sessions',
    label: 'Sessions',
    order: 2,
    showInHeader: true,
    showInSidebar: true,
    title: 'Sessions de travail',
  },
  {
    href: '/app/chronometer',
    icon: Timer,
    key: 'chronometer',
    label: 'Chronomètre',
    order: 3,
    showInHeader: false,
    showInSidebar: true,
    title: 'Chronomètre',
  },
  {
    href: '/app/user_work_data',
    icon: Database,
    key: 'user_work_data',
    label: 'Données',
    order: 4,
    showInHeader: false,
    showInSidebar: true,
    title: 'Données',
  },
]

// Fonctions utilitaires
export const getRouteByKey = (key: string): RouteConfig | undefined => {
  return routes.find((route) => route.key === key)
}

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  // Essaie d'abord une correspondance exacte
  let route = routes.find((r) => r.href === path)
  if (route) return route

  // Nettoie le path pour matcher avec les clés
  const cleanPath = path.replace(/^\/app\//, '').replace(/\/$/, '')
  route = routes.find((r) => {
    const routePath = r.href.replace(/^\/app\//, '').replace(/\/$/, '')
    return routePath === cleanPath
  })

  return route
}

export const getSidebarRoutes = (): RouteConfig[] => {
  return routes
    .filter((route) => route.showInSidebar)
    .sort((a, b) => (a.order || 999) - (b.order || 999))
}

export const getHeaderTabs = (): RouteConfig[] => {
  return routes
    .filter((route) => route.showInHeader)
    .sort((a, b) => (a.order || 999) - (b.order || 999))
}

export const getAllRoutesSorted = (): RouteConfig[] => {
  return [...routes].sort((a, b) => (a.order || 999) - (b.order || 999))
}

export const getTitleByPath = (path: string): string => {
  const route = getRouteByPath(path)
  return route?.title || 'Suivi du temps de travail'
}

export const getActiveHeaderTab = (path: string): string => {
  const route = getRouteByPath(path)
  return route?.headerTab || 'quickEntry'
}
