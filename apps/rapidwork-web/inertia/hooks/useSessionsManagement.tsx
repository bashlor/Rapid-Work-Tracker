import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from '@/utils/datetime'
import { tuyau } from '../tuyau'
import type { BackendWorkSession } from '@/types/backend'

export interface SessionFormData {
  taskId: string
  description: string
  duration: number // seconds
  startTime: string // HH:MM format or ISO string
  endTime: string // HH:MM format or ISO string
}

// Query Keys
export const sessionsKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionsKeys.all, 'list'] as const,
  byDate: (date: string) => [...sessionsKeys.lists(), 'by_date', date] as const,
}

export const useSessionsManagement = (selectedDate: Date, initialSessions?: BackendWorkSession[]) => {
  const queryClient = useQueryClient()
  
  const dateString = format(selectedDate, 'yyyy-MM-dd')

  const {
    data: sessions = [],
    error,
    isLoading,
    refetch,
  } = useQuery<BackendWorkSession[]>({
    queryKey: sessionsKeys.byDate(dateString),
    queryFn: async (): Promise<BackendWorkSession[]> => {
      try {
        // Utilisation de Tuyau avec typage sécurisé
        const response = await tuyau.api.sessions.by_date.$get({ 
          query: { date: dateString } 
        })
        
        // Le response de Tuyau contient les données typées
        const responseData = response as any
        
        // CORRECTION: Tuyau retourne { data: { data: [sessions] } }
        // Nous devons accéder à responseData.data.data
        const sessionsData = responseData.data?.data || []
        
        return sessionsData as BackendWorkSession[]
      } catch (error) {
        console.error('❌ Error fetching sessions:', error)
        throw error
      }
    },
    initialData: initialSessions, // Utiliser les données préchargées si disponibles
    staleTime: 0, // Considérer les données comme périmées immédiatement
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Permettre le refetch au montage
    enabled: true, // Toujours activer la query
  })

  const createSessionMutation = useMutation<BackendWorkSession, Error, SessionFormData>({
    mutationFn: async (sessionData: SessionFormData): Promise<BackendWorkSession> => {
      
      try {
        const response = await tuyau.api.sessions.$post({
          description: sessionData.description,
          taskId: sessionData.taskId,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          duration: sessionData.duration,
        })
        
        const responseData = response as any
        
        // Vérifier que la réponse contient des données
        if (!responseData || !responseData.data) {
          throw new Error('Réponse invalide du serveur')
        }
        
        // Retourner directement les données Tuyau typées
        return responseData.data as BackendWorkSession
      } catch (error) {
        throw error // Re-lancer l'erreur pour qu'elle soit gérée par React Query
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.byDate(dateString) })
      toast.success('Session créée avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de la création de la session:', error)
      toast.error('Erreur lors de la création de la session')
    },
  })

  const updateSessionMutation = useMutation<BackendWorkSession, Error, { sessionId: string; sessionData: Partial<SessionFormData> }>({
    mutationFn: async ({ sessionId, sessionData }): Promise<BackendWorkSession> => {
      const response = await tuyau.api.sessions({ id: sessionId }).$put({
        description: sessionData.description,
        endTime: sessionData.endTime,
      })
      
      const responseData = response as any
      
      // Retourner directement les données Tuyau typées
      return responseData.data as BackendWorkSession
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.byDate(dateString) })
      toast.success('Session mise à jour avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour de la session:', error)
      toast.error('Erreur lors de la mise à jour de la session')
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await tuyau.api.sessions({ id: sessionId }).$delete()
      return sessionId
    },
    onSuccess: (deletedId) => {
      // Optimistic update
      queryClient.setQueryData(sessionsKeys.byDate(dateString), (oldSessions: BackendWorkSession[] | undefined) => {
        if (!oldSessions) return []
        return oldSessions.filter((session) => session.id !== deletedId)
      })
      toast.success('Session supprimée avec succès')
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression de la session:', error)
      toast.error('Erreur lors de la suppression de la session')
      queryClient.invalidateQueries({ queryKey: sessionsKeys.byDate(dateString) })
    },
  })

  const createSession = async (sessionData: SessionFormData): Promise<BackendWorkSession> => {
    return await createSessionMutation.mutateAsync(sessionData)
  }

  const updateSession = async (
    sessionId: string,
    sessionData: Partial<SessionFormData>
  ): Promise<BackendWorkSession> => {
    return await updateSessionMutation.mutateAsync({ sessionId, sessionData })
  }

  const deleteSession = async (sessionId: string): Promise<boolean> => {
    try {
      await deleteSessionMutation.mutateAsync(sessionId)
      return true
    } catch {
      return false
    }
  }

  return {
    sessions,
    loading: isLoading,
    isLoading: isLoading,
    error,
    refetch,
    createSession,
    updateSession,
    deleteSession,
    createSessionMutation,
    updateSessionMutation,
    deleteSessionMutation,
  }
}
