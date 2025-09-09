import { Head } from '@inertiajs/react'
import TimerView from '../components/time-tracking/TimerView'
import { useDomainsManagement } from '../hooks/useDomainsManagement'
import { useTasksManagement } from '../hooks/useTasksManagement'
import { useSessionsManagement } from '../hooks/useSessionsManagement'
import type { ApiTask } from '../types/api'

export default function TimerViewPage() {
  // Utilisation des hooks pour charger les vraies données
  const { domains, loading: domainsLoading } = useDomainsManagement()
  const { tasks, loading: tasksLoading } = useTasksManagement()
  const { createSession } = useSessionsManagement(new Date())

  // Filtrer les tâches pour n'afficher que celles en cours et en attente
  const activeTasks = (Array.isArray(tasks) ? tasks : []).filter((task: ApiTask) => 
    task.status === 'ACTIVE' || task.status === 'PENDING' || 
    task.status === 'active' || task.status === 'pending' ||
    task.status === 'in_progress' || task.status === 'IN_PROGRESS'
  )

  const isLoading = domainsLoading || tasksLoading

  return (
    <>
      <Head title="Chronomètre" />
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Chargement des données...</div>
          </div>
        ) : (
          <TimerView 
            domains={domains}
            tasks={activeTasks}
            createSession={createSession}
          />
        )}
      </div>
    </>
  )
}
