import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { BackendTaskWithRelations } from '@/types/backend'

import { tuyau } from '@/tuyau'

export interface TaskFormData {
  description?: string
  domainId: string
  status: 'cancelled' | 'completed' | 'in_progress' | 'pending'
  subDomainId?: null | string
  title: string
}

// Query Keys
export const tasksKeys = {
  all: ['tasks'] as const,
  detail: (id: string) => [...tasksKeys.details(), id] as const,
  details: () => [...tasksKeys.all, 'detail'] as const,
  list: (filters: Record<string, any>) => [...tasksKeys.lists(), { filters }] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
}

export const useTasksManagement = (initialData?: BackendTaskWithRelations[]) => {
  const queryClient = useQueryClient()

  const {
    data: tasks = [],
    error,
    isLoading: loading,
    refetch,
  } = useQuery<BackendTaskWithRelations[]>({
    initialData: initialData,
    queryFn: async (): Promise<BackendTaskWithRelations[]> => {
      const response = await tuyau.api.tasks.$get()
      return response.data as BackendTaskWithRelations[] || []
    },
    queryKey: tasksKeys.lists(),
    staleTime: 10 * 60 * 1000, // 10 minutes - les tâches changent moins souvent
  })

  const addTaskMutation = useMutation<BackendTaskWithRelations, Error, TaskFormData>({
    mutationFn: async (newTaskData: TaskFormData): Promise<BackendTaskWithRelations> => {
      const response = await tuyau.api.tasks.$post({
        description: newTaskData.description || null,
        domain_id: newTaskData.domainId || null,
        status: newTaskData.status || 'pending', // Use provided status or default to pending
        subdomain_id: newTaskData.subDomainId || null,
        title: newTaskData.title,
      })
      return response.data as BackendTaskWithRelations
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout de la tâche:", error)
      toast.error("Erreur lors de l'ajout de la tâche")
    },
    onSuccess: () => {
      // Force immediate refetch to get updated data including relations
      refetch()
      // Also invalidate cache for good measure
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
      toast.success('Tâche ajoutée avec succès')
    },
  })

  const updateTaskMutation = useMutation<BackendTaskWithRelations, Error, { taskData: Partial<TaskFormData>; taskId: string; }>({
    mutationFn: async ({ taskData, taskId }): Promise<BackendTaskWithRelations> => {
      const response = await tuyau.api.tasks({ id: taskId }).$put({
        body: {
          description: taskData.description || null,
          domain_id: taskData.domainId || null,
          status: (taskData.status || 'pending') as 'cancelled' | 'completed' | 'in_progress' | 'pending',
          subdomain_id: taskData.subDomainId || null,
          title: taskData.title || '',
        }
      })
      return response.data as BackendTaskWithRelations
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
      toast.error('Erreur lors de la mise à jour de la tâche')
    },
    onSuccess: () => {
      // Refresh the data from server
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
      toast.success('Tâche mise à jour avec succès')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await tuyau.api.tasks({ id: taskId }).$delete()
      return taskId
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression de la tâche:', error)
      toast.error('Erreur lors de la suppression de la tâche')
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
    },
    onSuccess: (deletedId) => {
      // Optimistic update
      queryClient.setQueryData(tasksKeys.lists(), (oldTasks: BackendTaskWithRelations[] | undefined) => {
        if (!oldTasks) return []
        return oldTasks.filter((task) => task.id !== deletedId)
      })
      toast.success('Tâche supprimée avec succès')
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
      await updateTaskMutation.mutateAsync({ taskData, taskId })
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
    addTask,
    // Expose les mutations pour un contrôle plus fin si besoin
    addTaskMutation,
    deleteTask,
    deleteTaskMutation,
    error,
    fetchTasks,
    isLoading: loading,
    loading,
    refetch,
    tasks,
    updateTask,
    updateTaskMutation,
  }
}

// Hook pour récupérer une tâche spécifique
export const useTask = (taskId: string, initialData?: BackendTaskWithRelations) => {
  return useQuery({
    enabled: !!taskId, // Ne fetch que si taskId est défini
    initialData: initialData,
    queryFn: async (): Promise<BackendTaskWithRelations> => {
      // Since there's no individual task GET endpoint, we'll fetch all tasks and filter
      const response = await tuyau.api.tasks.$get()
      const tasks = response.data as BackendTaskWithRelations[] || []
      const task = tasks.find((t) => t.id === taskId)
      if (!task) throw new Error('Task not found')
      return task
    },
    queryKey: tasksKeys.detail(taskId),
  })
}
