import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tuyau } from '../tuyau'
import { BackendWorkSession } from '@/types/backend'

export interface SessionFormDataForBulk {
  id?: string
  taskId: string
  startTime: string
  endTime: string
  description?: string
  duration?: number
}

export interface BulkUpdateSessionsData {
  sessions: SessionFormDataForBulk[]
}

export const useBulkSessionsManagement = () => {
  const queryClient = useQueryClient()

  const bulkUpdateSessionsMutation = useMutation<
    { success: boolean; message: string; data: BackendWorkSession[] },
    Error,
    BulkUpdateSessionsData
  >({
    mutationFn: async (data: BulkUpdateSessionsData) => {
      const response = await tuyau.api.sessions.$put({
        sessions: data.sessions,
      })
      
      return response as any
    },
    onSuccess: (data) => {
      // Invalider toutes les queries de sessions pour forcer un refetch
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success(data.message || 'Sessions sauvegardées avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de la sauvegarde des sessions:', error)
      toast.error('Erreur lors de la sauvegarde des sessions')
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
