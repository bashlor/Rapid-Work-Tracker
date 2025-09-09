import { Button } from '@/components/ui/button'
import { Plus, RotateCcw } from 'lucide-react'
import { useWorkSession } from '@/contexts/WorkSessionContext'
import WorkSessionEntry from './WorkSessionEntry'
import { addMinutesToLocalInput } from '@/utils/datetime'

const DetailedEntry = () => {
  const { 
    sessions, 
    setSessions, 
    setHasUnsavedChanges, 
    createEmptySession, 
    isLoading
  } = useWorkSession()

  const handleAddSession = () => {
    setSessions((prev) => [...prev, createEmptySession()])
    setHasUnsavedChanges(true)
  }

  const handleResetAll = () => {
    setSessions([createEmptySession()])
    setHasUnsavedChanges(true)
    // Pas de toast pour le reset
  }

  const handleSaveSession = (updatedSession: any) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === updatedSession.id ? updatedSession : session))
    )
    // Le contexte détecte automatiquement les changements via useEffect
  }

  const handleDeleteSession = (sessionId: string) => {
    const filtered = sessions.filter((session) => session.id !== sessionId)
    // Garder au moins une session
    if (filtered.length === 0) {
      setSessions([createEmptySession()])
    } else {
      setSessions(filtered)
    }
    setHasUnsavedChanges(true)
  }

  const handleDuplicateSession = (session: any) => {
    const duplicatedSession = {
      ...session,
      id: crypto.randomUUID(),
      isNew: true,
      // Décaler l'heure de début et fin d'une heure
      startDateTime: session.startDateTime
        ? addMinutesToLocalInput(session.startDateTime, 60)
        : session.startDateTime,
      endDateTime: session.endDateTime
        ? addMinutesToLocalInput(session.endDateTime, 60)
        : session.endDateTime,
    }
    setSessions((prev) => [...prev, duplicatedSession])
    setHasUnsavedChanges(true)
  }

  return (
    <div className="space-y-8">
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des sessions...</span>
        </div>
      )}

      {/* Liste des sessions */}
      {!isLoading && sessions.length > 0 && (
        <div className="space-y-6">
          {sessions.map((session) => (
            <WorkSessionEntry
              key={session.id}
              session={session}
              onSave={handleSaveSession}
              onDelete={handleDeleteSession}
              onDuplicate={handleDuplicateSession}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sessions.length === 0 && (
        <div className="text-center p-10 border border-dashed border-slate-300 rounded-lg bg-slate-50">
          <p className="text-slate-600">Aucune session existante pour cette date</p>
          <div className="mt-4">
            <Button onClick={handleAddSession} variant="outline" size="lg">
              <Plus className="mr-2 h-5 w-5" /> Nouvelle session
            </Button>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      {!isLoading && (
        <div className="flex gap-4 pt-6">
          <Button onClick={handleAddSession} variant="outline" size="lg" className="w-auto">
            <Plus className="mr-2 h-5 w-5" />
            Ajouter une session
          </Button>

          <Button onClick={handleResetAll} variant="outline" size="lg" className="w-auto">
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}

export default DetailedEntry
