import type {
  MockDomain,
  MockSubdomain,
  MockTask,
  MockTaskSession,
  MockTimerEntry,
  MockWeeklyTask,
} from '@/types/mock'

// Re-export types for backward compatibility
export type Domain = MockDomain
export type Subdomain = MockSubdomain
export type Task = MockTask
export type TaskSession = MockTaskSession
export type TimerEntry = MockTimerEntry
export type WeeklyTask = MockWeeklyTask

// Mock domains and subdomains
export const mockDomains: Domain[] = [
  {
    id: '1',
    name: 'Logiciel',
    subdomains: [
      { id: '1', name: 'Frontend' },
      { id: '2', name: 'Backend' },
      { id: '3', name: 'Documentation' },
    ],
  },
  {
    id: '2',
    name: 'Gestion',
    subdomains: [
      { id: '4', name: 'Client' },
      { id: '5', name: 'Projet' },
      { id: '6', name: 'Réunion' },
    ],
  },
  {
    id: '3',
    name: 'Formation',
    subdomains: [
      { id: '7', name: 'Cours' },
      { id: '8', name: 'Atelier' },
    ],
  },
]

// Mock tasks
export const mockTasks: Task[] = [
  {
    date: '2025-04-22',
    description: 'Implémentation des composants UI',
    domain: 'Logiciel',
    endTime: '11:30',
    id: 'TASK-001',
    name: 'Développement UI',
    startTime: '09:00',
    status: 'in-progress',
    subdomain: 'Frontend',
  },
  {
    date: '2025-04-22',
    description: 'Discussion des besoins',
    domain: 'Gestion',
    endTime: '14:00',
    id: 'TASK-002',
    name: 'Meeting client',
    startTime: '13:00',
    status: 'in-progress',
    subdomain: 'Client',
  },
  {
    date: '2025-04-22',
    description: 'Rédaction des spécifications',
    domain: 'Logiciel',
    endTime: '16:00',
    id: 'TASK-003',
    name: 'Documentation',
    startTime: '14:30',
    status: 'in-progress',
    subdomain: 'Documentation',
  },
  {
    date: '2025-04-21',
    description: 'Planification du prochain sprint',
    domain: 'Gestion',
    endTime: '11:00',
    id: 'TASK-004',
    name: 'Planning sprint',
    startTime: '10:00',
    status: 'in-progress',
    subdomain: 'Projet',
  },
  {
    date: '2025-04-21',
    description: 'Formation sur les hooks React',
    domain: 'Formation',
    endTime: '17:00',
    id: 'TASK-005',
    name: 'Formation React',
    startTime: '14:00',
    status: 'in-progress',
    subdomain: 'Cours',
  },
]

// Mock timer entries pour les statistiques
const mockTimerEntries: TimerEntry[] = [
  {
    date: '2025-01-20',
    description: 'Implémentation des composants UI',
    domain: 'Logiciel',
    endTime: '2025-01-20T11:30:00Z',
    id: 'entry-1',
    startTime: '2025-01-20T09:00:00Z',
    subdomain: 'Frontend',
    taskId: 'TASK-001',
    userId: 'user-1',
  },
  {
    date: '2025-01-20',
    description: 'Discussion des besoins',
    domain: 'Gestion',
    endTime: '2025-01-20T14:00:00Z',
    id: 'entry-2',
    startTime: '2025-01-20T13:00:00Z',
    subdomain: 'Client',
    taskId: 'TASK-002',
    userId: 'user-1',
  },
  {
    date: '2025-01-21',
    description: 'Rédaction des spécifications',
    domain: 'Logiciel',
    endTime: '2025-01-21T16:00:00Z',
    id: 'entry-3',
    startTime: '2025-01-21T14:30:00Z',
    subdomain: 'Documentation',
    taskId: 'TASK-003',
    userId: 'user-1',
  },
  {
    date: '2025-01-21',
    description: 'Planification du prochain sprint',
    domain: 'Gestion',
    endTime: '2025-01-21T11:00:00Z',
    id: 'entry-4',
    startTime: '2025-01-21T10:00:00Z',
    subdomain: 'Projet',
    taskId: 'TASK-004',
    userId: 'user-1',
  },
  {
    date: '2025-01-22',
    description: 'Formation sur les hooks React',
    domain: 'Formation',
    endTime: '2025-01-22T17:00:00Z',
    id: 'entry-5',
    startTime: '2025-01-22T14:00:00Z',
    subdomain: 'Cours',
    taskId: 'TASK-005',
    userId: 'user-1',
  },
  {
    date: '2025-01-22',
    description: 'Développement API REST',
    domain: 'Logiciel',
    endTime: '2025-01-22T12:00:00Z',
    id: 'entry-6',
    startTime: '2025-01-22T09:00:00Z',
    subdomain: 'Backend',
    taskId: 'TASK-006',
    userId: 'user-1',
  },
  {
    date: '2025-01-23',
    description: 'Daily standup et planning',
    domain: 'Gestion',
    endTime: '2025-01-23T10:30:00Z',
    id: 'entry-7',
    startTime: '2025-01-23T08:30:00Z',
    subdomain: 'Réunion',
    taskId: 'TASK-007',
    userId: 'user-1',
  },
  {
    date: '2025-01-23',
    description: 'Finalisation des composants UI',
    domain: 'Logiciel',
    endTime: '2025-01-23T15:00:00Z',
    id: 'entry-8',
    startTime: '2025-01-23T11:00:00Z',
    subdomain: 'Frontend',
    taskId: 'TASK-001',
    userId: 'user-1',
  },
]

// Données mockées pour le calendrier hebdomadaire
export const mockWeeklyTasks: WeeklyTask[] = [
  // Lundi
  {
    assignedTo: 'Jean Dupont',
    day: 1,
    description: 'Implémentation des nouveaux composants pour le dashboard',
    domain: 'Logiciel',
    endTime: '11:30',
    id: 'task-week-1',
    priority: 'high',
    sessions: [
      {
        date: '2025-01-20',
        description: 'Création des composants de base',
        duration: 5400000, // 1h30
        endTime: '2025-01-20T10:30:00Z',
        id: 'session-1',
        startTime: '2025-01-20T09:00:00Z',
        taskId: 'task-week-1',
      },
      {
        date: '2025-01-20',
        description: 'Tests et corrections',
        duration: 2700000, // 45min
        endTime: '2025-01-20T11:30:00Z',
        id: 'session-2',
        startTime: '2025-01-20T10:45:00Z',
        taskId: 'task-week-1',
      },
    ],
    startTime: '09:00',
    status: 'in-progress',
    subdomain: 'Frontend',
    title: 'Développement UI Dashboard',
  },
  {
    assignedTo: 'Équipe Dev',
    day: 1,
    description: 'Daily standup et planification sprint',
    domain: 'Gestion',
    endTime: '15:00',
    id: 'task-week-2',
    priority: 'medium',
    sessions: [],
    startTime: '14:00',
    status: 'planned',
    subdomain: 'Réunion',
    title: 'Réunion équipe',
  },
  // Chevauchement lundi
  {
    assignedTo: 'Marie Martin',
    day: 1,
    description: 'Revue de code des pull requests',
    domain: 'Logiciel',
    endTime: '12:00',
    id: 'task-week-3',
    priority: 'medium',
    sessions: [
      {
        date: '2025-01-20',
        description: 'Revue complète du code',
        duration: 7200000, // 2h
        endTime: '2025-01-20T12:00:00Z',
        id: 'session-3',
        startTime: '2025-01-20T10:00:00Z',
        taskId: 'task-week-3',
      },
    ],
    startTime: '10:00',
    status: 'completed',
    subdomain: 'Backend',
    title: 'Code Review',
  },

  // Mardi
  {
    assignedTo: 'Formateur externe',
    day: 2,
    description: 'Session de formation sur les hooks avancés',
    domain: 'Formation',
    endTime: '12:00',
    id: 'task-week-4',
    priority: 'high',
    sessions: [],
    startTime: '09:30',
    status: 'planned',
    subdomain: 'Cours',
    title: 'Formation React Hooks',
  },
  {
    assignedTo: 'Pierre Durand',
    day: 2,
    description: 'Création des endpoints pour les statistiques',
    domain: 'Logiciel',
    endTime: '16:30',
    id: 'task-week-5',
    priority: 'high',
    sessions: [
      {
        date: '2025-01-21',
        description: 'Implémentation des endpoints de base',
        duration: 5400000, // 1h30
        endTime: '2025-01-21T15:00:00Z',
        id: 'session-4',
        startTime: '2025-01-21T13:30:00Z',
        taskId: 'task-week-5',
      },
    ],
    startTime: '13:30',
    status: 'in-progress',
    subdomain: 'Backend',
    title: 'Développement API',
  },

  // Mercredi
  {
    assignedTo: 'Chef de projet',
    day: 3,
    description: 'Présentation des nouvelles fonctionnalités',
    domain: 'Gestion',
    endTime: '11:30',
    id: 'task-week-6',
    priority: 'high',
    sessions: [],
    startTime: '10:00',
    status: 'planned',
    subdomain: 'Client',
    title: 'Réunion client',
  },
  {
    assignedTo: 'Tech Writer',
    day: 3,
    description: 'Rédaction de la documentation API',
    domain: 'Logiciel',
    endTime: '17:00',
    id: 'task-week-7',
    priority: 'medium',
    sessions: [
      {
        date: '2025-01-22',
        description: 'Documentation des endpoints',
        duration: 7200000, // 2h
        endTime: '2025-01-22T16:00:00Z',
        id: 'session-5',
        startTime: '2025-01-22T14:00:00Z',
        taskId: 'task-week-7',
      },
    ],
    startTime: '14:00',
    status: 'in-progress',
    subdomain: 'Documentation',
    title: 'Documentation technique',
  },
  // Chevauchement mercredi
  {
    assignedTo: 'QA Team',
    day: 3,
    description: 'Écriture des tests pour les nouveaux composants',
    domain: 'Logiciel',
    endTime: '12:30',
    id: 'task-week-8',
    priority: 'medium',
    sessions: [],
    startTime: '10:30',
    status: 'planned',
    subdomain: 'Frontend',
    title: 'Tests unitaires',
  },

  // Jeudi
  {
    assignedTo: 'DevOps',
    day: 4,
    description: 'Mise en ligne de la version de test',
    domain: 'Logiciel',
    endTime: '10:00',
    id: 'task-week-9',
    priority: 'high',
    sessions: [
      {
        date: '2025-01-23',
        description: 'Déploiement réussi',
        duration: 7200000, // 2h
        endTime: '2025-01-23T10:00:00Z',
        id: 'session-6',
        startTime: '2025-01-23T08:00:00Z',
        taskId: 'task-week-9',
      },
    ],
    startTime: '08:00',
    status: 'completed',
    subdomain: 'Backend',
    title: 'Déploiement staging',
  },
  {
    assignedTo: 'Performance Team',
    day: 4,
    description: "Audit des performances de l'application",
    domain: 'Logiciel',
    endTime: '16:30',
    id: 'task-week-10',
    priority: 'medium',
    sessions: [
      {
        date: '2025-01-23',
        description: 'Analyse des métriques',
        duration: 3600000, // 1h
        endTime: '2025-01-23T15:30:00Z',
        id: 'session-7',
        startTime: '2025-01-23T14:30:00Z',
        taskId: 'task-week-10',
      },
    ],
    startTime: '14:30',
    status: 'in-progress',
    subdomain: 'Frontend',
    title: 'Analyse performance',
  },

  // Vendredi
  {
    assignedTo: 'Scrum Master',
    day: 5,
    description: 'Bilan et amélioration continue',
    domain: 'Gestion',
    endTime: '12:30',
    id: 'task-week-11',
    priority: 'medium',
    sessions: [],
    startTime: '11:00',
    status: 'planned',
    subdomain: 'Projet',
    title: 'Rétrospective sprint',
  },
  {
    assignedTo: 'Équipe complète',
    day: 5,
    description: 'Préparation de la démonstration client',
    domain: 'Gestion',
    endTime: '17:00',
    id: 'task-week-12',
    priority: 'high',
    sessions: [],
    startTime: '15:00',
    status: 'planned',
    subdomain: 'Client',
    title: 'Préparation démo',
  },
  // Chevauchement vendredi
  {
    assignedTo: 'Senior Dev',
    day: 5,
    description: 'Refactoring et optimisation',
    domain: 'Logiciel',
    endTime: '13:00',
    id: 'task-week-13',
    priority: 'low',
    sessions: [
      {
        date: '2025-01-24',
        description: 'Refactoring des utilitaires',
        duration: 3600000, // 1h
        endTime: '2025-01-24T12:30:00Z',
        id: 'session-8',
        startTime: '2025-01-24T11:30:00Z',
        taskId: 'task-week-13',
      },
    ],
    startTime: '11:30',
    status: 'in-progress',
    subdomain: 'Backend',
    title: 'Nettoyage code',
  },
]

// In-memory data store
class MockDataStore {
  private domains: Domain[] = [...mockDomains]
  private tasks: Task[] = [...mockTasks]
  private timerEntries: TimerEntry[] = [...mockTimerEntries]
  private weeklyTasks: WeeklyTask[] = [...mockWeeklyTasks]

  addDomain(domain: Domain): Promise<void> {
    this.domains.push(domain)
    return Promise.resolve()
  }

  addTask(task: Task): Promise<void> {
    this.tasks.push(task)
    return Promise.resolve()
  }

  addTimerEntry(entry: TimerEntry): Promise<void> {
    this.timerEntries.push(entry)
    return Promise.resolve()
  }

  addWeeklyTask(task: WeeklyTask): Promise<void> {
    this.weeklyTasks.push(task)
    return Promise.resolve()
  }

  // Clear all data
  clearAll(): Promise<void> {
    this.domains = [...mockDomains]
    this.tasks = [...mockTasks]
    this.timerEntries = []
    this.weeklyTasks = [...mockWeeklyTasks]
    return Promise.resolve()
  }

  deleteDomain(id: string): Promise<void> {
    this.domains = this.domains.filter((d) => d.id !== id)
    return Promise.resolve()
  }

  deleteTask(id: string): Promise<void> {
    this.tasks = this.tasks.filter((t) => t.id !== id)
    return Promise.resolve()
  }

  deleteTimerEntry(id: string): Promise<void> {
    this.timerEntries = this.timerEntries.filter((e) => e.id !== id)
    return Promise.resolve()
  }

  deleteWeeklyTask(id: string): Promise<void> {
    this.weeklyTasks = this.weeklyTasks.filter((t) => t.id !== id)
    return Promise.resolve()
  }

  // Domain services
  getDomains(): Promise<Domain[]> {
    return Promise.resolve([...this.domains])
  }

  // Task services
  getTasks(): Promise<Task[]> {
    return Promise.resolve([...this.tasks])
  }

  getTasksByDate(date: string): Promise<Task[]> {
    return Promise.resolve(this.tasks.filter((t) => t.date === date))
  }

  // Timer entry services
  getTimerEntries(): Promise<TimerEntry[]> {
    return Promise.resolve([...this.timerEntries])
  }

  // Weekly tasks services
  getWeeklyTasks(): Promise<WeeklyTask[]> {
    return Promise.resolve([...this.weeklyTasks])
  }

  updateDomain(id: string, domain: Partial<Domain>): Promise<void> {
    const index = this.domains.findIndex((d) => d.id === id)
    if (index !== -1) {
      this.domains[index] = { ...this.domains[index], ...domain }
    }
    return Promise.resolve()
  }

  updateTask(id: string, task: Partial<Task>): Promise<void> {
    const index = this.tasks.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...task }
    }
    return Promise.resolve()
  }

  updateTimerEntry(id: string, entry: Partial<TimerEntry>): Promise<void> {
    const index = this.timerEntries.findIndex((e) => e.id === id)
    if (index !== -1) {
      this.timerEntries[index] = { ...this.timerEntries[index], ...entry }
    }
    return Promise.resolve()
  }

  updateWeeklyTask(id: string, task: Partial<WeeklyTask>): Promise<void> {
    const index = this.weeklyTasks.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.weeklyTasks[index] = { ...this.weeklyTasks[index], ...task }
    }
    return Promise.resolve()
  }
}

// Global instance
export const mockDataStore = new MockDataStore()

// Convenience services matching old API
export const domainService = {
  addDomain: (domain: Domain) => mockDataStore.addDomain(domain),
  deleteDomain: (id: string) => mockDataStore.deleteDomain(id),
  getAllDomains: () => mockDataStore.getDomains(),
  updateDomain: (id: string, domain: Partial<Domain>) => mockDataStore.updateDomain(id, domain),
}

export const taskService = {
  addTask: (task: Task) => mockDataStore.addTask(task),
  deleteTask: (id: string) => mockDataStore.deleteTask(id),
  getAllTasks: () => mockDataStore.getTasks(),
  getTasksByDate: (date: string) => mockDataStore.getTasksByDate(date),
  updateTask: (id: string, task: Partial<Task>) => mockDataStore.updateTask(id, task),
}

export const timerService = {
  addEntry: (entry: TimerEntry) => mockDataStore.addTimerEntry(entry),
  deleteEntry: (id: string) => mockDataStore.deleteTimerEntry(id),
  getAllEntries: () => mockDataStore.getTimerEntries(),
  updateEntry: (id: string, entry: Partial<TimerEntry>) =>
    mockDataStore.updateTimerEntry(id, entry),
}

export const weeklyTaskService = {
  addTask: (task: WeeklyTask) => mockDataStore.addWeeklyTask(task),
  deleteTask: (id: string) => mockDataStore.deleteWeeklyTask(id),
  getAllTasks: () => mockDataStore.getWeeklyTasks(),
  updateTask: (id: string, task: Partial<WeeklyTask>) => mockDataStore.updateWeeklyTask(id, task),
}

// Export timer entries for external use
export const getMockTimerEntries = (): TimerEntry[] => {
  return [...mockTimerEntries]
}

// Helper function to transform timer entries to weekly tasks for calendar display
export const transformTimerEntriesToWeeklyTasks = (entries: TimerEntry[]): WeeklyTask[] => {
  return entries.map((entry) => {
    const startDate = new Date(entry.startTime)
    const endDate = new Date(entry.endTime)
    const dayOfWeek = startDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const calendarDay = dayOfWeek === 0 ? 7 : dayOfWeek // Convert to 1-7 where Monday = 1

    // Calculate duration in milliseconds
    const duration = endDate.getTime() - startDate.getTime()

    return {
      assignedTo: 'Utilisateur',
      day: calendarDay,
      description: entry.description,
      domain: entry.domain,
      endTime: endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      id: entry.id,
      priority: 'medium' as const,
      sessions: [
        {
          date: entry.date,
          description: entry.description,
          duration: duration,
          endTime: entry.endTime,
          id: `session-${entry.id}`,
          startTime: entry.startTime,
          taskId: entry.taskId,
        },
      ],
      startTime: startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed' as const, // Timer entries are completed sessions
      subdomain: entry.subdomain,
      title: entry.description,
    }
  })
}
