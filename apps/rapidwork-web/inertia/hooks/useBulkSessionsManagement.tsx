import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { BackendWorkSession } from '@/types/backend'

import { tuyau } from '../tuyau'

export interface BulkUpdateSessionsData {
  sessions: SessionFormDataForBulk[]
}

export interface SessionFormDataForBulk {
  description?: string
  duration?: number
  endTime: string
  id?: string
  startTime: string
  taskId: string
}

export const useBulkSessionsManagement = () => {
  const queryClient = useQueryClient()

  const bulkUpdateSessionsMutation = useMutation<
    { data: BackendWorkSession[]; message: string; success: boolean; },
    Error,
    BulkUpdateSessionsData
  >({
    mutationFn: async (data: BulkUpdateSessionsData) => {
      const response = await tuyau.api.sessions.$put({
        sessions: data.sessions,
      })
      
      return response as any
    },
    onError: (error) => {
      console.error('Erreur lors de la sauvegarde des sessions:', error)
      toast.error('Erreur lors de la sauvegarde des sessions')
    },
    onSuccess: (data) => {
      // Invalider toutes les queries de sessions pour forcer un refetch
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success(data.message || 'Sessions sauvegardées avec succès')
    },
  })

  const bulkUpdateSessions = async (data: BulkUpdateSessionsData) => {
    return await bulkUpdateSessionsMutation.mutateAsync(data)
  }

  return {
    bulkUpdateSessions,
    isBulkUpdating: bulkUpdateSessionsMutation.isPending,
  }
}
