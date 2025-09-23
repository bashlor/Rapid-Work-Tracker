// Fichier de remplacement temporaire pour éviter les erreurs d'import
// TODO: Migrer tous les composants pour ne plus utiliser ce fichier

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

// Services vides pour éviter les erreurs
export const domainService = {
  addDomain: async (domain: Domain) => {
    console.warn('domainService.addDomain is deprecated')
  },
  deleteDomain: async (id: string) => {
    console.warn('domainService.deleteDomain is deprecated')
  },
  getAllDomains: async (): Promise<Domain[]> => {
    console.warn('domainService.getAllDomains is deprecated')
    return []
  },
  updateDomain: async (id: string, domain: Partial<Domain>) => {
    console.warn('domainService.updateDomain is deprecated')
  },
}

export const taskService = {
  addTask: async (task: Task) => {
    console.warn('taskService.addTask is deprecated')
  },
  deleteTask: async (id: string) => {
    console.warn('taskService.deleteTask is deprecated')
  },
  getAllTasks: async (): Promise<Task[]> => {
    console.warn('taskService.getAllTasks is deprecated')
    return []
  },
  getTasksByDate: async (date: string): Promise<Task[]> => {
    console.warn('taskService.getTasksByDate is deprecated')
    return []
  },
  updateTask: async (id: string, task: Partial<Task>) => {
    console.warn('taskService.updateTask is deprecated')
  },
}

export const timerService = {
  addEntry: async (entry: TimerEntry) => {
    console.warn('timerService.addEntry is deprecated - use TimerContext instead')
  },
  deleteEntry: async (id: string) => {
    console.warn('timerService.deleteEntry is deprecated')
  },
  getAllEntries: async (): Promise<TimerEntry[]> => {
    console.warn(
      'timerService.getAllEntries is deprecated - use getTimerEntries from TimerContext instead'
    )
    return []
  },
  updateEntry: async (id: string, entry: Partial<TimerEntry>) => {
    console.warn('timerService.updateEntry is deprecated')
  },
}

export const weeklyTaskService = {
  addTask: async (task: WeeklyTask) => {
    console.warn('weeklyTaskService.addTask is deprecated')
  },
  deleteTask: async (id: string) => {
    console.warn('weeklyTaskService.deleteTask is deprecated')
  },
  getAllTasks: async (): Promise<WeeklyTask[]> => {
    console.warn('weeklyTaskService.getAllTasks is deprecated')
    return []
  },
  updateTask: async (id: string, task: Partial<WeeklyTask>) => {
    console.warn('weeklyTaskService.updateTask is deprecated')
  },
}

// Fonctions utilitaires vides
export const getMockTimerEntries = (): TimerEntry[] => {
  console.warn('getMockTimerEntries is deprecated - use getTimerEntries from TimerContext instead')
  return []
}

export const transformTimerEntriesToWeeklyTasks = (entries: TimerEntry[]): WeeklyTask[] => {
  console.warn('transformTimerEntriesToWeeklyTasks is deprecated')
  return []
}

// Export d'un store vide pour compatibilité
export const mockDataStore = {
  addDomain: async (domain: Domain) => {
    console.warn('mockDataStore is deprecated')
  },
  addTask: async (task: Task) => {
    console.warn('mockDataStore is deprecated')
  },
  addTimerEntry: async (entry: TimerEntry) => {
    console.warn('mockDataStore is deprecated')
  },
  addWeeklyTask: async (task: WeeklyTask) => {
    console.warn('mockDataStore is deprecated')
  },
  clearAll: async () => {
    console.warn('mockDataStore is deprecated')
  },
  deleteDomain: async (id: string) => {
    console.warn('mockDataStore is deprecated')
  },
  deleteTask: async (id: string) => {
    console.warn('mockDataStore is deprecated')
  },
  deleteTimerEntry: async (id: string) => {
    console.warn('mockDataStore is deprecated')
  },
  deleteWeeklyTask: async (id: string) => {
    console.warn('mockDataStore is deprecated')
  },
  getDomains: async (): Promise<Domain[]> => {
    console.warn('mockDataStore is deprecated')
    return []
  },
  getTasks: async (): Promise<Task[]> => {
    console.warn('mockDataStore is deprecated')
    return []
  },
  getTasksByDate: async (date: string): Promise<Task[]> => {
    console.warn('mockDataStore is deprecated')
    return []
  },
  getTimerEntries: async (): Promise<TimerEntry[]> => {
    console.warn('mockDataStore is deprecated')
    return []
  },
  getWeeklyTasks: async (): Promise<WeeklyTask[]> => {
    console.warn('mockDataStore is deprecated')
    return []
  },
  updateDomain: async (id: string, domain: Partial<Domain>) => {
    console.warn('mockDataStore is deprecated')
  },
  updateTask: async (id: string, task: Partial<Task>) => {
    console.warn('mockDataStore is deprecated')
  },
  updateTimerEntry: async (id: string, entry: Partial<TimerEntry>) => {
    console.warn('mockDataStore is deprecated')
  },
  updateWeeklyTask: async (id: string, task: Partial<WeeklyTask>) => {
    console.warn('mockDataStore is deprecated')
  },
}
