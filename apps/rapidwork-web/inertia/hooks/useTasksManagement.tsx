import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tuyau } from '@/tuyau'
import type { BackendTaskWithRelations } from '@/types/backend'

export interface TaskFormData {
  title: string
  description?: string
  domainId: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  subDomainId?: string | null
}

// Query Keys
export const tasksKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...tasksKeys.lists(), { filters }] as const,
  details: () => [...tasksKeys.all, 'detail'] as const,
  detail: (id: string) => [...tasksKeys.details(), id] as const,
}

export const useTasksManagement = (initialData?: BackendTaskWithRelations[]) => {
  const queryClient = useQueryClient()

  const {
    data: tasks = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<BackendTaskWithRelations[]>({
    queryKey: tasksKeys.lists(),
    queryFn: async (): Promise<BackendTaskWithRelations[]> => {
      const response = await tuyau.api.tasks.$get()
      return response.data as BackendTaskWithRelations[] || []
    },
    initialData: initialData,
    staleTime: 10 * 60 * 1000, // 10 minutes - les tâches changent moins souvent
  })

  const addTaskMutation = useMutation<BackendTaskWithRelations, Error, TaskFormData>({
    mutationFn: async (newTaskData: TaskFormData): Promise<BackendTaskWithRelations> => {
      const response = await tuyau.api.tasks.$post({
        title: newTaskData.title,
        description: newTaskData.description || null,
        domain_id: newTaskData.domainId || null,
        subdomain_id: newTaskData.subDomainId || null,
        status: newTaskData.status || 'pending', // Use provided status or default to pending
      })
      return response.data as BackendTaskWithRelations
    },
    onSuccess: () => {
      // Force immediate refetch to get updated data including relations
      refetch()
      // Also invalidate cache for good measure
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
      toast.success('Tâche ajoutée avec succès')
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout de la tâche:", error)
      toast.error("Erreur lors de l'ajout de la tâche")
    },
  })

  const updateTaskMutation = useMutation<BackendTaskWithRelations, Error, { taskId: string; taskData: Partial<TaskFormData> }>({
    mutationFn: async ({ taskId, taskData }): Promise<BackendTaskWithRelations> => {
      const response = await tuyau.api.tasks({ id: taskId }).$put({
        body: {
          title: taskData.title || '',
          description: taskData.description || null,
          domain_id: taskData.domainId || null,
          subdomain_id: taskData.subDomainId || null,
          status: (taskData.status || 'pending') as 'pending' | 'in_progress' | 'completed' | 'cancelled',
        }
      })
      return response.data as BackendTaskWithRelations
    },
    onSuccess: () => {
      // Refresh the data from server
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
      toast.success('Tâche mise à jour avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
      toast.error('Erreur lors de la mise à jour de la tâche')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await tuyau.api.tasks({ id: taskId }).$delete()
      return taskId
    },
    onSuccess: (deletedId) => {
      // Optimistic update
      queryClient.setQueryData(tasksKeys.lists(), (oldTasks: BackendTaskWithRelations[] | undefined) => {
        if (!oldTasks) return []
        return oldTasks.filter((task) => task.id !== deletedId)
      })
      toast.success('Tâche supprimée avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression de la tâche:', error)
      toast.error('Erreur lors de la suppression de la tâche')
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
    },
  })

  // Wrapper functions pour garder la même API
  const addTask = async (taskData: TaskFormData): Promise<boolean> => {
    try {
      await addTaskMutation.mutateAsync(taskData)
      return true
    } catch {
      return false
    }
  }

  const updateTask = async (taskId: string, taskData: Partial<TaskFormData>): Promise<boolean> => {
    try {
      await updateTaskMutation.mutateAsync({ taskId, taskData })
      return true
    } catch {
      return false
    }
  }

  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      await deleteTaskMutation.mutateAsync(taskId)
      return true
    } catch {
      return false
    }
  }

  const fetchTasks = async () => {
    return await refetch()
  }

  return {
    tasks,
    loading,
    isLoading: loading,
    error,
    refetch,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    // Expose les mutations pour un contrôle plus fin si besoin
    addTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  }
}

// Hook pour récupérer une tâche spécifique
export const useTask = (taskId: string, initialData?: BackendTaskWithRelations) => {
  return useQuery({
    queryKey: tasksKeys.detail(taskId),
    queryFn: async (): Promise<BackendTaskWithRelations> => {
      // Since there's no individual task GET endpoint, we'll fetch all tasks and filter
      const response = await tuyau.api.tasks.$get()
      const tasks = response.data as BackendTaskWithRelations[] || []
      const task = tasks.find((t) => t.id === taskId)
      if (!task) throw new Error('Task not found')
      return task
    },
    initialData: initialData,
    enabled: !!taskId, // Ne fetch que si taskId est défini
  })
}
