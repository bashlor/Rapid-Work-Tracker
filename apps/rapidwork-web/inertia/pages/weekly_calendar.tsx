import { Head } from '@inertiajs/react'
import WeeklyCalendarView from '../components/time-tracking/WeeklyCalendarView'
import type { WeeklyCalendarPageProps } from '../types/page_props'
import { 
  transformTimerEntriesToWeeklyTasks,
  type TimerEntry 
} from '@/lib/mock_data'
import { format } from '@/utils/datetime'

// Get sample timer entries for demonstration
const getSampleTimerEntries = (): TimerEntry[] => {
  const today = new Date()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  return [
    {
      id: 'timer-entry-1',
      taskId: 'task-frontend-dev',
      userId: 'user-1',
      date: format(today, 'yyyy-MM-dd'),
      startTime: format(new Date(new Date().setHours(9, 0, 0, 0)), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      endTime: format(new Date(new Date().setHours(11, 30, 0, 0)), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      description: 'Développement interface utilisateur',
      domain: 'Logiciel',
      subdomain: 'Frontend',
    },
    {
      id: 'timer-entry-2', 
      taskId: 'task-client-meeting',
      userId: 'user-1',
      date: format(today, 'yyyy-MM-dd'),
      startTime: format(new Date(new Date().setHours(14, 0, 0, 0)), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      endTime: format(new Date(new Date().setHours(15, 45, 0, 0)), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      description: 'Réunion avec le client',
      domain: 'Gestion',
      subdomain: 'Client',
    },
    {
      id: 'timer-entry-3',
      taskId: 'task-documentation',
      userId: 'user-1', 
      date: format(yesterday, 'yyyy-MM-dd'),
      startTime: format(new Date(yesterday.setHours(10, 0, 0, 0)), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      endTime: format(new Date(yesterday.setHours(12, 30, 0, 0)), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      description: 'Rédaction documentation technique',
      domain: 'Logiciel',
      subdomain: 'Documentation',
    },
  ]
}

export default function WeeklyCalendarPage(props: WeeklyCalendarPageProps) {
  const { user, flash } = props

  // Transform timer entries to tasks for calendar display
  const timerEntries = getSampleTimerEntries()
  const weeklyTasks = transformTimerEntriesToWeeklyTasks(timerEntries)

  return (
    <div className="space-y-6">
      <Head title="Calendrier Hebdomadaire" />
        {/* Flash Messages */}
        {flash?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {flash.success}
          </div>
        )}
        {flash?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {flash.error}
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Calendrier Hebdomadaire - Sessions de Travail
          </h1>
          <p className="text-gray-600">
            Visualisation de vos sessions de travail réalisées au cours de la semaine
          </p>
          {user && (
            <p className="text-sm text-blue-600 mt-2">
              Connecté en tant que: {user.name}
            </p>
          )}
        </div>

      {/* Calendar Component */}
      <WeeklyCalendarView 
        weeklyTasks={weeklyTasks}
      />
      
      {/* Sessions Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Résumé des Sessions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Sessions Total</h4>
            <p className="text-2xl font-bold text-blue-600">{weeklyTasks.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900">Domaines</h4>
            <p className="text-2xl font-bold text-green-600">
              {new Set(weeklyTasks.map(t => t.domain)).size}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900">Temps Total</h4>
            <p className="text-2xl font-bold text-purple-600">
              {weeklyTasks.reduce((total, task) => {
                const [startHour, startMin] = task.startTime.split(':').map(Number)
                const [endHour, endMin] = task.endTime.split(':').map(Number)
                const startMinutes = startHour * 60 + startMin
                const endMinutes = endHour * 60 + endMin
                const durationHours = (endMinutes - startMinutes) / 60
                return total + durationHours
              }, 0).toFixed(1)}h
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
