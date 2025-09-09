// Centralisation de toutes les query keys pour l'application
// Cela permet une meilleure gestion du cache et des invalidations

export const queryKeys = {
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    week: (date: string) => [...queryKeys.dashboard.all, 'week', date] as const,
  },

  // Domains
  domains: {
    all: ['domains'] as const,
    detail: (id: string) => [...queryKeys.domains.details(), id] as const,
    details: () => [...queryKeys.domains.all, 'detail'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.domains.lists(), { filters }] as const,
    lists: () => [...queryKeys.domains.all, 'list'] as const,
  },

  // Sessions (si utilisé)
  sessions: {
    all: ['sessions'] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const,
    details: () => [...queryKeys.sessions.all, 'detail'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.sessions.lists(), { filters }] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
  },

  // Stats
  stats: {
    all: ['stats'] as const,
    calculation: (entriesHash: string) => [...queryKeys.stats.calculations(), entriesHash] as const,
    calculations: () => [...queryKeys.stats.all, 'calculations'] as const,
    monthly: () => [...queryKeys.stats.all, 'monthly'] as const,
    weekly: () => [...queryKeys.stats.all, 'weekly'] as const,
    yearly: () => [...queryKeys.stats.all, 'yearly'] as const,
  },

  // Tasks
  tasks: {
    all: ['tasks'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.tasks.lists(), { filters }] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
  },

  // Time Entries
  timeEntries: {
    all: ['timeEntries'] as const,
    detail: (id: string) => [...queryKeys.timeEntries.details(), id] as const,
    details: () => [...queryKeys.timeEntries.all, 'detail'] as const,
    list: (date: string) => [...queryKeys.timeEntries.lists(), date] as const,
    lists: () => [...queryKeys.timeEntries.all, 'list'] as const,
  },

  // User data
  user: {
    all: ['user'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
  },
} as const

// Fonctions utilitaires pour invalider des groupes de queries
export const invalidationHelpers = {
  // Invalide tout
  invalidateAll: (queryClient: any) => {
    queryClient.invalidateQueries()
  },

  // Invalide toutes les données de configuration
  invalidateConfigData: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.domains.all })
  },

  // Invalide toutes les données liées au temps
  invalidateTimeData: (queryClient: any) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.stats.all })
  },
}
