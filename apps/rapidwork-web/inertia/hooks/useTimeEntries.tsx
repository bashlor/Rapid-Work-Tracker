import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useTimer } from '@/contexts/TimerContext'
import { TimerEntry, timerService } from '@/lib/mock_data'
import { format } from '@/utils/datetime'

// Query Keys
export const timeEntriesKeys = {
  all: ['timeEntries'] as const,
  detail: (id: string) => [...timeEntriesKeys.details(), id] as const,
  details: () => [...timeEntriesKeys.all, 'detail'] as const,
  list: (date: string) => [...timeEntriesKeys.lists(), date] as const,
  lists: () => [...timeEntriesKeys.all, 'list'] as const,
}

// Fetch functions
const fetchTimeEntries = async (): Promise<TimerEntry[]> => {
  return await timerService.getAllEntries()
}

const fetchTimeEntriesByDate = async (date: string): Promise<TimerEntry[]> => {
  const allEntries = await timerService.getAllEntries()
  return allEntries.filter((entry) => entry.date === date)
}

export const useTimeEntries = (date: Date, initialData?: TimerEntry[]) => {
  const { formatElapsedTime } = useTimer()
  const formattedDate = format(date, 'yyyy-MM-dd')

  const {
    data: entries = [],
    error,
    isLoading: loading,
    refetch,
  } = useQuery({
    initialData: initialData,
    queryFn: () => fetchTimeEntriesByDate(formattedDate),
    queryKey: timeEntriesKeys.list(formattedDate),
    staleTime: 2 * 60 * 1000, // 2 minutes - les entries changent souvent
  })

  const calculateTotalTime = () => {
    return entries.reduce((total, entry) => {
      const startTime = new Date(entry.startTime)
      const endTime = new Date(entry.endTime)
      const duration = endTime.getTime() - startTime.getTime()
      return total + duration
    }, 0)
  }

  const getDailyStats = () => {
    const domainMap = new Map<string, number>()
    const taskMap = new Map<string, number>()
    let maxDomainTime = 0
    let maxDomain = ''
    let maxTaskTime = 0
    let maxTask = ''

    entries.forEach((entry) => {
      const startTime = new Date(entry.startTime)
      const endTime = new Date(entry.endTime)
      const duration = endTime.getTime() - startTime.getTime()

      // Add to domain map
      const currentDomainValue = domainMap.get(entry.domain) || 0
      domainMap.set(entry.domain, currentDomainValue + duration)

      // Add to task map
      const currentTaskValue = taskMap.get(entry.taskId) || 0
      taskMap.set(entry.taskId, currentTaskValue + duration)

      // Track max domain
      if (currentDomainValue + duration > maxDomainTime) {
        maxDomainTime = currentDomainValue + duration
        maxDomain = entry.domain
      }

      // Track max task
      if (currentTaskValue + duration > maxTaskTime) {
        maxTaskTime = currentTaskValue + duration
        maxTask = entry.taskId
      }
    })

    return {
      domainData: Array.from(domainMap.entries()).map(([name, seconds]) => ({
        name,
        value: Math.round((seconds / 3600) * 10) / 10, // Convert to hours with 1 decimal
      })),
      mainActivity: maxTask ? `${maxTask} (${formatElapsedTime(maxTaskTime)})` : 'Aucune',
      mainDomain: maxDomain ? `${maxDomain} (${formatElapsedTime(maxDomainTime)})` : 'Aucun',
      tasksCompleted: entries.length,
      totalTime: calculateTotalTime(),
    }
  }

  return {
    calculateTotalTime,
    entries,
    error,
    getDailyStats,
    loading,
    refetch,
  }
}

// Hook pour toutes les entries (sans filtre par date)
export const useAllTimeEntries = (initialData?: TimerEntry[]) => {
  const {
    data: entries = [],
    error,
    isLoading: loading,
    refetch,
  } = useQuery({
    initialData: initialData,
    queryFn: fetchTimeEntries,
    queryKey: timeEntriesKeys.lists(),
  })

  return {
    entries,
    error,
    loading,
    refetch,
  }
}

// Mutations pour créer/modifier/supprimer des entries
export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newEntry: Omit<TimerEntry, 'id'>) => {
      const entry: TimerEntry = {
        ...newEntry,
        id: Date.now().toString(), // Temporary ID generation
      }
      await timerService.addEntry?.(entry) // Si la méthode existe dans le service
      return entry
    },
    onError: (error) => {
      console.error("Erreur lors de la création de l'entrée:", error)
      toast.error("Erreur lors de la création de l'entrée de temps")
    },
    onSuccess: () => {
      // Invalider et refetch les queries
      queryClient.invalidateQueries({ queryKey: timeEntriesKeys.all })
      toast.success('Entrée de temps créée avec succès')
    },
  })
}

export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedEntry: TimerEntry) => {
      await timerService.updateEntry?.(updatedEntry.id, updatedEntry) // Si la méthode existe
      return updatedEntry
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour de l'entrée:", error)
      toast.error("Erreur lors de la mise à jour de l'entrée de temps")
    },
    onSuccess: (updatedEntry) => {
      // Mettre à jour le cache
      queryClient.setQueryData(timeEntriesKeys.lists(), (oldEntries: TimerEntry[] | undefined) => {
        if (!oldEntries) return [updatedEntry]
        return oldEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
      })

      // Invalider les queries par date
      queryClient.invalidateQueries({
        queryKey: timeEntriesKeys.list(updatedEntry.date),
      })

      toast.success('Entrée de temps mise à jour avec succès')
    },
  })
}

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entryId: string) => {
      await timerService.deleteEntry?.(entryId) // Si la méthode existe
      return entryId
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression de l'entrée:", error)
      toast.error("Erreur lors de la suppression de l'entrée de temps")
    },
    onSuccess: (deletedId) => {
      // Supprimer du cache
      queryClient.setQueryData(timeEntriesKeys.lists(), (oldEntries: TimerEntry[] | undefined) => {
        if (!oldEntries) return []
        return oldEntries.filter((entry) => entry.id !== deletedId)
      })

      // Invalider toutes les queries de date
      queryClient.invalidateQueries({ queryKey: timeEntriesKeys.lists() })

      toast.success('Entrée de temps supprimée avec succès')
    },
  })
}
