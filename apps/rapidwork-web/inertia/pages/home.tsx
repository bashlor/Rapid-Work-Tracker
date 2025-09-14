import { Head } from '@inertiajs/react'
import { format, formatDurationFromMinutes } from '@/utils/datetime'
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, Activity } from 'lucide-react'
import { useGetUserDataDashboard, useWeekNavigation } from '../hooks/useGetUserDataDashboard'
import WeeklyCalendarView from '../components/time-tracking/WeeklyCalendarView'
import ErrorBoundary from '../components/ErrorBoundary'
import type { HomePageProps } from '../types/page_props'

export default function Home(props: HomePageProps) {
  const { user, flash } = props
  const isDevelopment = import.meta.env.DEV

  // Week navigation
  const {
    currentWeek,
    weekBoundaries,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isCurrentWeek,
  } = useWeekNavigation()

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useGetUserDataDashboard({
    currentDate: currentWeek.toISOString(),
  })

  // Format week display
  const formatWeekRange = () => {
    const start = format(weekBoundaries.weekStart, 'd MMM')
    const end = format(weekBoundaries.weekEnd, 'd MMM yyyy')
    return `${start} - ${end}`
  }

  // Transform sessions data for calendar
  const transformSessionsForCalendar = () => {
    if (!dashboardData?.dailySessions) return []

    const calendarTasks: any[] = []
    dashboardData.dailySessions.forEach((day: any) => {
      day.sessions.forEach((session: any) => {
        // Calculer la durée en minutes
        const startDate = new Date(session.startTime)
        const endDate = new Date(session.endTime)
        const durationMs = endDate.getTime() - startDate.getTime()
        const durationMinutes = Math.floor(durationMs / (1000 * 60))
        
        // Filtrer les sessions de moins de 15 minutes
        if (durationMinutes < 15) {
          return
        }
        
        const dayOfWeek = startDate.getDay()
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Mon=0, Sun=6

        // Récupérer le nom de la tâche depuis les données API
        const taskTitle = session.task?.title || session.description || 'Tâche sans nom'
        const taskDescription = session.task?.description || session.description || 'Session de travail'
        
        calendarTasks.push({
          id: session.id,
          title: taskTitle, // Utilise le titre de la tâche au lieu de "Session:"
          description: taskDescription,
          day: adjustedDay,
          startTime: format(startDate, 'HH:mm'),
          endTime: format(new Date(session.endTime), 'HH:mm'),
          duration: session.duration,
          // Propriétés requises pour CalendarTask
          status: 'completed' as const, // Les sessions sont généralement terminées
          priority: 'medium' as const,
          domain: session.task?.domain?.name || session.domain,
          subdomain: session.task?.subdomain?.name || session.subdomain,
          assignedTo: session.userId || 'current',
          sessions: [{
            id: session.id,
            taskId: session.taskId || session.id,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            date: format(startDate, 'yyyy-MM-dd'),
            description: session.description
          }]
        })
      })
    })

    return calendarTasks
  }

  const weeklyTasks = transformSessionsForCalendar()

  // Helper function to safely format duration from various input types
  const safeDurationFormat = (duration: any): string => {
    // Handle null, undefined, or invalid values
    if (duration == null) return '0min'
    
    // If it's already a formatted string, return it
    if (typeof duration === 'string') return duration
    
    // Convert to number and validate
    const numericDuration = Number(duration)
    if (isNaN(numericDuration) || numericDuration < 0) return '0min'
    
    // Use the utility function with a valid number
    return formatDurationFromMinutes(numericDuration)
  }

  // Format date range for sessions that might span multiple days
  const formatSessionDateRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    // Check if session spans multiple days
    const startDay = format(start, 'yyyy-MM-dd')
    const endDay = format(end, 'yyyy-MM-dd')
    
    if (startDay === endDay) {
      // Same day: show date once with time range
      return `${format(start, 'dd/MM/yyyy HH:mm')} - ${format(end, 'HH:mm')}`
    } else {
      // Different days: show full date and time for both
      return `${format(start, 'dd/MM/yyyy HH:mm')} - ${format(end, 'dd/MM/yyyy HH:mm')}`
    }
  }

  return (
    <>
      <Head title="Tableau de bord" />
      <div className="container mx-auto px-4 py-6 space-y-6">
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

        {/* Welcome Message with User Name */}
        {user && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-blue-900">
              Bonjour {dashboardData?.userName || (user as any).fullName || 'Utilisateur'} ! 👋
            </h1>
            <p className="text-blue-700 mt-2">
              Voici votre tableau de bord pour la semaine du {formatWeekRange()}
            </p>
          </div>
        )}

        {/* Week Navigation */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Semaine précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                {formatWeekRange()}
              </h2>
              <button
                onClick={goToCurrentWeek}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  isCurrentWeek 
                    ? 'bg-gray-100 text-gray-500 cursor-default' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                disabled={isCurrentWeek}
              >
                {isCurrentWeek ? 'Semaine actuelle' : 'Aller à la semaine actuelle'}
              </button>
            </div>

            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Semaine suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekly Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Temps total (semaine)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.weeklyStats?.totalDuration ? safeDurationFormat(dashboardData.weeklyStats.totalDuration) : '0min'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sessions (semaine)</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData?.weeklyStats.sessionCount || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tâches en cours</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData?.weeklyStats.activeTasksCount || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tâches terminées</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {dashboardData?.weeklyStats.completedTasksCount || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-200" />
            </div>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Calendrier hebdomadaire - Sessions de travail
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Visualisez vos sessions de travail pour la semaine sélectionnée
            </p>
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
              Les sessions de moins de 15 minutes ne sont pas affichées dans le calendrier
            </p>
          </div>
          <div className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-8 p-6">
                Erreur lors du chargement des données
              </div>
            ) : (
              <ErrorBoundary>
                <div className="p-6">
                  <WeeklyCalendarView 
                    weeklyTasks={weeklyTasks} 
                    currentDate={currentWeek}
                  />
                </div>
              </ErrorBoundary>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        {dashboardData?.recentSessions && dashboardData.recentSessions.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sessions récentes</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {dashboardData.recentSessions.slice(0, 5).map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {session.description || 'Session sans description'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatSessionDateRange(session.startTime, session.endTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {safeDurationFormat(session.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Debug Info - Only in Development */}
        {isDevelopment && dashboardData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Debug - Données du dashboard</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Utilisateur:</strong> {dashboardData.userName} (ID: {dashboardData.userId})
              </div>
              <div>
                <strong>Période:</strong> {format(new Date(dashboardData.weekStartDate), 'dd/MM/yyyy')} - {format(new Date(dashboardData.weekEndDate), 'dd/MM/yyyy')}
              </div>
              <div>
                <strong>Stats semaine:</strong> {JSON.stringify(dashboardData.weeklyStats || {})}
              </div>
              <div>
                <strong>Sessions par jour:</strong> {dashboardData.dailySessions.map((d: any) => `${d.date}: ${d.sessions.length} sessions`).join(', ')}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
