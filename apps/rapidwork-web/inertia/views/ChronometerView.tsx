import TimerView from '@/components/time-tracking/TimerComponents/TimerView'
import { useDomainsManagement } from '@/hooks/useDomainsManagement'
import { useSessionsManagement } from '@/hooks/useSessionsManagement'
import { useTasksManagement } from '@/hooks/useTasksManagement'
import { BackendTaskWithRelations } from '@/types'

export function ChronometerView() {
  // Utilisation des hooks pour charger les vraies données
  const { domains, loading: domainsLoading } = useDomainsManagement()
  const { loading: tasksLoading, tasks } = useTasksManagement()
  const { createSession } = useSessionsManagement(new Date())

  // Filtrer les tâches pour n'afficher que celles en cours et en attente
  // Seuls les statuts valides du type BackendTaskWithRelations
  const activeTasks = (Array.isArray(tasks) ? tasks : []).filter(
    (task: BackendTaskWithRelations) => task.status === 'in_progress' || task.status === 'pending'
  )

  const isLoading = domainsLoading || tasksLoading

  return (
    <div className="container mx-auto px-4 py-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-muted-foreground">Chargement des données...</div>
        </div>
      ) : (
        <TimerView createSession={createSession} domains={domains} tasks={activeTasks} />
      )}
    </div>
  )
}
