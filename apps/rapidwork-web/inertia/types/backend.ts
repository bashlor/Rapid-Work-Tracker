/**
 * Types correspondant exactement aux DTOs retournés par le backend
 * Ces types doivent rester synchronisés avec les DTOs du backend
 */

export interface BackendDomain {
  createdAt: string
  id: string
  name: string
  updatedAt: string
}

export interface BackendDomainWithSubdomains {
  createdAt: string
  id: string
  name: string
  subdomains: BackendSubdomain[]
  updatedAt: string
}

export interface BackendSubdomain {
  createdAt: string
  id: string
  name: string
  updatedAt: string
}

export interface BackendSubdomainWithDomainId {
  createdAt: string
  domainId: string
  id: string
  name: string
  updatedAt: string
}

export interface BackendTaskWithRelations {
  createdAt: string
  description: string
  domain: BackendDomain | null
  domainId: null | string
  id: string
  status: 'cancelled' | 'completed' | 'in_progress' | 'pending'
  subdomain: BackendSubdomainWithDomainId | null
  subDomainId: null | string
  title: string
  updatedAt?: string
}

/**
 * Types pour les sessions de travail (à adapter selon votre modèle)
 * Ces types doivent être créés quand vous ajouterez les sessions
 */
export interface BackendWorkSession {
  createdAt: string
  date: string // YYYY-MM-DD
  description?: string
  duration: number // en secondes
  endTime: string // ISO string
  id: string
  startTime: string // ISO string
  taskId: string
  updatedAt: string
}

/**
 * Types adaptés pour l'UI React
 */
export interface TaskWithSessions {
  description: string
  domain: null | {
    id: string
    name: string
  }
  // Props pour l'UI
  expanded: boolean
  id: string
  selected: boolean
  sessions: BackendWorkSession[]
  status: string
  subdomain: null | {
    id: string
    name: string
  }
  title: string
}

/**
 * Props des pages Inertia correspondant aux contrôleurs
 */
export interface UserWorkDataPageProps {
  domains: BackendDomainWithSubdomains[]
  tasks: BackendTaskWithRelations[]
}
