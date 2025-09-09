import { useQuery } from '@tanstack/react-query'
import { TaskWithSessions, BackendTaskWithRelations, BackendWorkSession } from '@/types/backend'
import { tuyau } from '@/tuyau'

// Query keys spécifiques
export const tasksWithSessionsKeys = {
  all: ['tasksWithSessions'] as const,
  lists: () => [...tasksWithSessionsKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...tasksWithSessionsKeys.lists(), { filters }] as const,
}

// Fonction pour combiner les données
const fetchTasksWithSessions = async (): Promise<TaskWithSessions[]> => {
  const [tasksResponse] = await Promise.all([
    tuyau.api.tasks.$get(),
    // Note: sessions API might not exist yet, so commenting out for now
    // tuyau.api.sessions.$get(),
  ])

  const tasks = tasksResponse.data as BackendTaskWithRelations[] || []
  // For now, using empty sessions array until sessions API is available
  const sessions: BackendWorkSession[] = []

  return combineTasksAndSessions(tasks, sessions)
}

// Fonction utilitaire pour combiner les données
const combineTasksAndSessions = (tasks: BackendTaskWithRelations[], sessions: BackendWorkSession[]): TaskWithSessions[] => {
  const sessionsByTask = sessions.reduce(
    (acc, session) => {
      if (!acc[session.taskId]) {
        acc[session.taskId] = []
      }
      acc[session.taskId].push(session)
      return acc
    },
    {} as Record<string, BackendWorkSession[]>
  )

  return tasks.map((task) => {
    const taskSessions = sessionsByTask[task.id] || []
    
    return {
      ...task,
      expanded: false,
      selected: false,
      sessions: taskSessions,
    }
  })
}

export const useTasksWithSessions = (initialData?: TaskWithSessions[]) => {
  const {
    data: tasksWithSessions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: tasksWithSessionsKeys.lists(),
    queryFn: fetchTasksWithSessions,
    initialData: initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    tasksWithSessions,
    loading,
    error,
    refetch,
  }
}

// Hook optimisé qui utilise les données déjà en cache
export const useTasksWithSessionsOptimized = (initialData?: TaskWithSessions[]) => {

  const {
    data: tasksWithSessions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: tasksWithSessionsKeys.lists(),
    queryFn: async () => {
      // For now, just use the regular fetch function
      // TODO: Implement cache optimization when needed
      return fetchTasksWithSessions()
    },
    initialData: initialData,
    staleTime: 5 * 60 * 1000,
  })

  return {
    tasksWithSessions,
    loading,
    error,
    refetch,
  }
}
