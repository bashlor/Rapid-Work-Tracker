import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { format } from '@/utils/datetime'
import { localInputToUtcIso, utcIsoToLocalInput } from '@/utils/datetime'
import { toast } from 'sonner'
import { useSessionsManagement } from '@/hooks/useSessionsManagement'
import { useBulkSessionsManagement } from '@/hooks/useBulkSessionsManagement'
import type { BackendWorkSession } from '@/types/backend'

// Type pour les données préchargées
interface InitialData {
  sessions?: BackendWorkSession[]
  selectedDate?: string
}

export interface WorkSession {
  id: string
  domainId: string
  domainName: string
  subdomainId?: string
  subdomainName?: string
  taskId: string
  taskName: string
  startDateTime: string // Format ISO: "2025-01-24T09:00"
  endDateTime: string // Format ISO: "2025-01-24T11:00"
  description: string // Description de la session
  useSubdomain: boolean
  isNew: boolean
}

export interface WorkSessionContextType {
  selectedDate: Date
  sessions: WorkSession[]
  hasUnsavedChanges: boolean
  isLoading: boolean
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>
  setSessions: React.Dispatch<React.SetStateAction<WorkSession[]>>
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>
  handleDateChange: (date: Date) => void
  handleGlobalSave: () => Promise<void>
  handleCancelAll: () => void
  createEmptySession: () => WorkSession
}

const WorkSessionContext = createContext<WorkSessionContextType | null>(null)

export const useWorkSession = () => {
  const context = useContext(WorkSessionContext)
  if (!context) {
    throw new Error('useWorkSession must be used within a WorkSessionProvider')
  }
  return context
}

interface WorkSessionProviderProps {
  children: React.ReactNode
  initialData?: InitialData
}

export const WorkSessionProvider: React.FC<WorkSessionProviderProps> = ({ 
  children, 
  initialData 
}) => {
  // Initialiser la date avec les données préchargées ou la date actuelle
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialData?.selectedDate) {
      return new Date(initialData.selectedDate + 'T00:00:00')
    }
    return new Date()
  })
  
  const [sessions, setSessions] = useState<WorkSession[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialSessionsSnapshot, setInitialSessionsSnapshot] = useState<WorkSession[]>([])

  // Surveiller les changements dans les sessions pour mettre à jour hasUnsavedChanges
  useEffect(() => {
    if (initialSessionsSnapshot.length === 0 && sessions.length === 0) {
      // Pas de données à comparer
      setHasUnsavedChanges(false)
      return
    }

    // Vérifier s'il y a des nouvelles sessions (isNew: true)
    const hasNewSessions = sessions.some(session => session.isNew)
    
    // Vérifier s'il y a des sessions modifiées (comparaison avec le snapshot initial)
    const hasModifiedSessions = sessions.some(session => {
      if (session.isNew) return false // Les nouvelles sessions sont déjà couvertes
      
      const original = initialSessionsSnapshot.find(s => s.id === session.id)
      if (!original) return true // Session qui n'existait pas dans le snapshot
      
      // Comparer les champs importants
      return (
        session.domainId !== original.domainId ||
        session.subdomainId !== original.subdomainId ||
        session.taskId !== original.taskId ||
        session.startDateTime !== original.startDateTime ||
        session.endDateTime !== original.endDateTime ||
        session.description !== original.description ||
        session.useSubdomain !== original.useSubdomain
      )
    })

    // Vérifier s'il y a des sessions supprimées (présentes dans le snapshot mais pas dans les sessions actuelles)
    const hasDeletedSessions = initialSessionsSnapshot.some(originalSession => {
      return !sessions.find(currentSession => currentSession.id === originalSession.id)
    })

    const shouldHaveUnsavedChanges = hasNewSessions || hasModifiedSessions || hasDeletedSessions
    if (shouldHaveUnsavedChanges !== hasUnsavedChanges) {
      setHasUnsavedChanges(shouldHaveUnsavedChanges)
    }
  }, [sessions, initialSessionsSnapshot, hasUnsavedChanges])

  // Conserver la date initiale pour savoir quand utiliser les initialData
  const initialDateRef = React.useRef(format(selectedDate, 'yyyy-MM-dd'))
  const currentDateString = format(selectedDate, 'yyyy-MM-dd')
  const shouldUseInitialData = currentDateString === initialDateRef.current

  // Utiliser le hook de gestion des sessions pour l'API avec données préchargées
  // Seulement pour la date initiale
  const { 
    sessions: apiSessions, 
    loading: isLoading,
    refetch,
    deleteSession
  } = useSessionsManagement(selectedDate, shouldUseInitialData ? initialData?.sessions : undefined)

  // Hook pour la sauvegarde en bulk
  const { bulkUpdateSessions } = useBulkSessionsManagement()

  // Synchroniser les sessions API avec l'état local (avec garde pour éviter les boucles)
  const lastSyncRef = React.useRef<string | null>(null)

  useEffect(() => {
    // Construire une signature stable des sessions API
    const signature = apiSessions && apiSessions.length > 0
      ? apiSessions.map((s) => s.id).sort().join(',')
      : 'empty'

    if (isLoading) return

    if (lastSyncRef.current === signature) {
      // Rien à faire, déjà synchronisé
      return
    }

    lastSyncRef.current = signature

    if (apiSessions && apiSessions.length > 0) {
      const workSessions: WorkSession[] = apiSessions.map((session) => ({
        id: session.id,
        domainId: '',
        domainName: '',
        subdomainId: '',
        subdomainName: '',
        taskId: session.taskId,
        taskName: '',
        // Convert UTC ISO from API to local input format for datetime-local fields
        startDateTime: utcIsoToLocalInput(session.startTime || ''),
        endDateTime: utcIsoToLocalInput(session.endTime || ''),
        description: session.description || '', // Utiliser la description de l'API ou une chaîne vide
        useSubdomain: false,
        isNew: false,
      }))

      setSessions((current) => {
        const currentIds = current.map((s) => s.id).sort().join(',')
        const newIds = workSessions.map((s) => s.id).sort().join(',')
        if (currentIds !== newIds) {
          // Mise à jour du snapshot initial lorsque les sessions sont chargées
          setInitialSessionsSnapshot(workSessions)
          return workSessions
        }
        return current
      })
    } else {
      // Aucune session
      setSessions((current) => (current.length === 0 ? current : []))
    }
  }, [apiSessions, isLoading, setSessions])

  // Créer une nouvelle session vide - utilise une ref pour éviter les problèmes de dépendances
  const selectedDateRef = React.useRef(selectedDate)
  selectedDateRef.current = selectedDate

  const createEmptySession = useCallback((): WorkSession => {
    // Utiliser la ref pour accéder à la date actuelle sans créer de dépendance
    const currentDate = selectedDateRef.current
    const startDateTime = format(currentDate, 'yyyy-MM-dd') + 'T09:00'
    const endDateTime = format(currentDate, 'yyyy-MM-dd') + 'T10:00'

    return {
      id: crypto.randomUUID(),
      domainId: '',
      domainName: '',
      subdomainId: '',
      subdomainName: '',
      taskId: '',
      taskName: '',
      startDateTime,
      endDateTime,
      description: '', // Description vide pour une nouvelle session
      useSubdomain: false,
      isNew: true,
    }
  }, [])

  // Mettre à jour les dates des sessions quand la date globale change
  const handleDateChange = useCallback((newDate: Date) => {
    
    setSelectedDate(newDate)
    
    // Reset les changements non sauvegardés car on change de date
    setHasUnsavedChanges(false)
    
    // Reset le snapshot car on va charger de nouvelles sessions
    setInitialSessionsSnapshot([])
    
    // Forcer un refetch des sessions pour la nouvelle date
    setTimeout(() => {
      refetch()
    }, 100) // Petit délai pour laisser le temps à la date de se mettre à jour
    
    console.groupEnd()
  }, [refetch])

  const handleGlobalSave = useCallback(async () => {

    try {
      // Identifier les sessions existantes (déjà sauvegardées en base)
      const existingApiIds = new Set((apiSessions || []).map((s) => s.id))
      
      // 1. Identifier les sessions supprimées (présentes dans le snapshot initial mais absentes actuellement)
      const deletedSessions = initialSessionsSnapshot.filter(originalSession => {
        // Session était dans le snapshot initial ET n'est plus dans les sessions actuelles
        return !sessions.find(currentSession => currentSession.id === originalSession.id) &&
               !originalSession.isNew // Ne pas essayer de supprimer des sessions qui n'ont jamais été sauvegardées
      })
      
      // 2. Filtrer les sessions valides mais non encore sauvegardées (nouvelles ou modifiées)
      const unsavedSessions = sessions.filter((session) => {
        // Doit avoir les champs requis
        const isValid = session.taskId && session.startDateTime && session.endDateTime
        
        // N'est PAS encore sauvegardée en base (soit nouvelle, soit modifiée mais pas encore persistée)
        const isUnsaved = session.isNew || !existingApiIds.has(session.id)
        
        return isValid && isUnsaved
      })

      // Vérifier s'il y a quelque chose à faire
      if (deletedSessions.length === 0 && unsavedSessions.length === 0) {
        return
      }

      // 3. Supprimer les sessions supprimées en premier
      if (deletedSessions.length > 0) {
        
        for (const sessionToDelete of deletedSessions) {
          try {
            // Appeler l'API de suppression (nous devons importer deleteSession du hook)
            await deleteSession(sessionToDelete.id)
          } catch (error) {
            console.error('❌ Erreur lors de la suppression de la session:', sessionToDelete.id, error)
            throw error // Arrêter le processus en cas d'erreur
          }
        }
      }

      // 4. Sauvegarder les sessions nouvelles/modifiées
      if (unsavedSessions.length > 0) {
        
        // Préparer les données pour l'API bulk (seulement les non sauvegardées)
        const sessionsForBulk = unsavedSessions.map((session) => {
          // Calculer la durée en minutes
          const startTime = new Date(session.startDateTime)
          const endTime = new Date(session.endDateTime)
          const duration = Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 60000))

          return {
            id: session.isNew ? undefined : session.id, // Pas d'ID pour les nouvelles sessions
            taskId: session.taskId,
            // Send UTC ISO to API
            startTime: localInputToUtcIso(session.startDateTime),
            endTime: localInputToUtcIso(session.endDateTime),
            description: session.description || `Session: ${session.taskName}`, // Utiliser la description saisie ou celle par défaut
            duration,
          }
        })
        
        // Appel de l'API bulk
        await bulkUpdateSessions({ sessions: sessionsForBulk })
        
        // Mettre à jour l'état local : marquer les sessions comme non-nouvelles
        setSessions(prevSessions => 
          prevSessions.map(session => {
            const wasUnsaved = unsavedSessions.some(us => us.id === session.id)
            if (wasUnsaved) {
              return { ...session, isNew: false }
            }
            return session
          })
        )
      }
      
      // 5. Mettre à jour le snapshot initial pour refléter l'état sauvegardé
      // Le nouveau snapshot doit contenir uniquement les sessions actuelles (sans les supprimées)
      // et marquer toutes les sessions comme non-nouvelles
      const newSnapshot = sessions.map(session => ({
        ...session,
        isNew: false // Toutes les sessions sont maintenant sauvegardées
      }))
      
      setInitialSessionsSnapshot(newSnapshot)
      setHasUnsavedChanges(false)
      
      toast.success('Toutes les sessions ont été sauvegardées avec succès')
      
      // Refetch pour récupérer les sessions mises à jour
      setTimeout(() => {
        refetch()
      }, 500)
      
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la sauvegarde des sessions')
    }
  }, [sessions, apiSessions, bulkUpdateSessions, refetch, setSessions])

  const handleCancelAll = useCallback(() => {

    
    setSessions([...initialSessionsSnapshot])
    setHasUnsavedChanges(false)
    toast.info('Toutes les modifications ont été annulées')
    
    console.groupEnd()
  }, [initialSessionsSnapshot])

  const value: WorkSessionContextType = {
    selectedDate,
    sessions,
    hasUnsavedChanges,
    isLoading,
    setSelectedDate,
    setSessions,
    setHasUnsavedChanges,
    handleDateChange,
    handleGlobalSave,
    handleCancelAll,
    createEmptySession,
  }

  return <WorkSessionContext.Provider value={value}>{children}</WorkSessionContext.Provider>
}
