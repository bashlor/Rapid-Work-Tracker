// Types for mock data - used for development and testing

export type MockDomain = {
  id: string
  name: string
  subdomains: MockSubdomain[]
}

export type MockSubdomain = {
  id: string
  name: string
}

export type MockTask = {
  date: string
  description: string
  domain: string
  endTime: string
  id: string
  name: string
  startTime: string
  status: 'completed' | 'in-progress' | 'pending'
  subdomain: string
}

// Sessions de travail associées à une tâche
export interface MockTaskSession {
  date: string
  description?: string
  duration: number // en millisecondes
  endTime: string
  id: string
  startTime: string
  taskId: string
}

export interface MockTimerEntry {
  date: string
  description: string
  domain: string
  endTime: string
  id: string
  startTime: string
  subdomain: string
  taskId: string
  userId: string
}

// Interface pour les tâches du calendrier hebdomadaire
export interface MockWeeklyTask {
  assignedTo?: string
  // Champs pour le positionnement (chevauchements)
  column?: number
  columnCount?: number
  day: number // 1-5 (Lundi=1, Vendredi=5)
  description: string
  domain: string
  endTime: string // format: "HH:mm"
  id: string
  priority: 'high' | 'low' | 'medium'
  sessions?: MockTaskSession[]
  startTime: string // format: "HH:mm"
  status: 'cancelled' | 'completed' | 'in-progress' | 'planned'
  subdomain: string
  title: string
}
