import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { BackendWorkSession } from '@/types/backend'

import { format } from '@/utils/datetime'

import { tuyau } from '../tuyau'

export interface SessionFormData {
  description: string
  duration: number // seconds
  endTime: string // HH:MM format or ISO string
  startTime: string // HH:MM format or ISO string
  taskId: string
}

// Query Keys
export const sessionsKeys = {
  all: ['sessions'] as const,
  byDate: (date: string) => [...sessionsKeys.lists(), 'by_date', date] as const,
  lists: () => [...sessionsKeys.all, 'list'] as const,
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
    enabled: true, // Toujours activer la query
    initialData: initialSessions, // Utiliser les données préchargées si disponibles
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
    queryKey: sessionsKeys.byDate(dateString),
    refetchOnMount: true, // Permettre le refetch au montage
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 0, // Considérer les données comme périmées immédiatement
  })

  const createSessionMutation = useMutation<BackendWorkSession, Error, SessionFormData>({
    mutationFn: async (sessionData: SessionFormData): Promise<BackendWorkSession> => {
      
      try {
        const response = await tuyau.api.sessions.$post({
          description: sessionData.description,
          duration: sessionData.duration,
          endTime: sessionData.endTime,
          startTime: sessionData.startTime,
          taskId: sessionData.taskId,
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
    onError: (error) => {
      console.error('Erreur lors de la création de la session:', error)
      toast.error('Erreur lors de la création de la session')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.byDate(dateString) })
      toast.success('Session créée avec succès')
    },
  })

  const updateSessionMutation = useMutation<BackendWorkSession, Error, { sessionData: Partial<SessionFormData>; sessionId: string; }>({
    mutationFn: async ({ sessionData, sessionId }): Promise<BackendWorkSession> => {
      const response = await tuyau.api.sessions.$put({
        sessions: [
          {
            description: sessionData.description,
            endTime: sessionData.endTime!,
            id: sessionId,
            startTime: sessionData.startTime!,
            taskId: sessionData.taskId!,
          },
        ],
      })
      const responseData = response as any
      const updated = responseData?.data?.data?.[0] || responseData?.data
      return updated as BackendWorkSession
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour de la session:', error)
      toast.error('Erreur lors de la mise à jour de la session')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.byDate(dateString) })
      toast.success('Session mise à jour avec succès')
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await tuyau.api.sessions({ id: sessionId }).$delete()
      return sessionId
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression de la session:', error)
      toast.error('Erreur lors de la suppression de la session')
      queryClient.invalidateQueries({ queryKey: sessionsKeys.byDate(dateString) })
    },
    onSuccess: (deletedId) => {
      // Optimistic update
      queryClient.setQueryData(sessionsKeys.byDate(dateString), (oldSessions: BackendWorkSession[] | undefined) => {
        if (!oldSessions) return []
        return oldSessions.filter((session) => session.id !== deletedId)
      })
      toast.success('Session supprimée avec succès')
    },
  })

  const createSession = async (sessionData: SessionFormData): Promise<BackendWorkSession> => {
    return await createSessionMutation.mutateAsync(sessionData)
  }

  const updateSession = async (
    sessionId: string,
    sessionData: Partial<SessionFormData>
  ): Promise<BackendWorkSession> => {
    return await updateSessionMutation.mutateAsync({ sessionData, sessionId })
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
    createSession,
    createSessionMutation,
    deleteSession,
    deleteSessionMutation,
    error,
    isLoading: isLoading,
    loading: isLoading,
    refetch,
    sessions,
    updateSession,
    updateSessionMutation,
  }
}
