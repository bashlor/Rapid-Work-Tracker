import { Activity, Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import environment from '@/config/environment'
import {
  format,
  formatSessionDateRange,
  formatWeekRange,
  safeDurationFormat,
} from '@/utils/datetime'

import ErrorBoundary from '../components/ErrorBoundary'
import WeeklyCalendar from '../components/time-tracking/HomeComponents/WeeklyCalendarComponents/WeeklyCalendar'
import { useGetUserDataDashboard, useWeekNavigation } from '../hooks/useGetUserDataDashboard'

const DashboardDebug =
  environment.APP_ENV === 'development'
    ? React.lazy(() => import('@/components/time-tracking/HomeComponents/DashboardDebug'))
    : () => null

interface HomeViewProps {
  flash?: {
    error?: string
    success?: string
  }
  user: any
}

export function HomeView({ flash, user }: HomeViewProps) {
  const { t } = useTranslation()

  // Week navigation
  const {
    currentWeek,
    goToCurrentWeek,
    goToNextWeek,
    goToPreviousWeek,
    isCurrentWeek,
    weekBoundaries,
  } = useWeekNavigation()

  // Fetch dashboard data
  const {
    data: dashboardData,
    error,
    isLoading,
  } = useGetUserDataDashboard({
    currentDate: currentWeek.toISOString(),
  })

  // Format week display using utility function
  const formatWeekDisplay = () => {
    return formatWeekRange(weekBoundaries.weekStart, weekBoundaries.weekEnd)
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
        const taskTitle = session.task?.title || session.description || t('home.task_without_name')
        const taskDescription =
          session.task?.description || session.description || t('home.work_session')

        calendarTasks.push({
          assignedTo: session.userId || 'current',
          day: adjustedDay,
          description: taskDescription,
          domain: session.task?.domain?.name || session.domain,
          duration: session.duration,
          endTime: format(new Date(session.endTime), 'HH:mm'),
          id: session.id,
          priority: 'medium' as const,
          sessions: [
            {
              date: format(startDate, 'yyyy-MM-dd'),
              description: session.description,
              duration: session.duration,
              endTime: session.endTime,
              id: session.id,
              startTime: session.startTime,
              taskId: session.taskId || session.id,
            },
          ],
          startTime: format(startDate, 'HH:mm'),
          // Propriétés requises pour CalendarTask
          status: 'completed' as const, // Les sessions sont généralement terminées
          subdomain: session.task?.subdomain?.name || session.subdomain,
          title: taskTitle, // Utilise le titre de la tâche au lieu de "Session:"
        })
      })
    })

    return calendarTasks
  }

  const weeklyTasks = transformSessionsForCalendar()

  // Helper functions are now imported from datetime utils

  return (
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
            {t('home.welcome', {
              name: dashboardData?.userName || (user as any).fullName || t('home.user'),
            })}
          </h1>
          <p className="text-blue-700 mt-2">
            {t('home.week_range', { range: formatWeekDisplay() })}
          </p>
        </div>
      )}

      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <button
            aria-label={t('home.previous_week')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              {formatWeekDisplay()}
            </h2>
            <button
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                isCurrentWeek
                  ? 'bg-gray-100 text-gray-500 cursor-default'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              disabled={isCurrentWeek}
              onClick={goToCurrentWeek}
            >
              {isCurrentWeek ? t('home.current_week') : t('home.go_to_current_week')}
            </button>
          </div>

          <button
            aria-label={t('home.next_week')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={goToNextWeek}
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
              <p className="text-sm text-gray-600 mb-1">{t('home.stats.total_time')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData?.weeklyStats?.totalDuration
                  ? safeDurationFormat(dashboardData.weeklyStats.totalDuration)
                  : '0min'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('home.stats.sessions_count')}</p>
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
              <p className="text-sm text-gray-600 mb-1">{t('home.stats.active_tasks')}</p>
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
              <p className="text-sm text-gray-600 mb-1">{t('home.stats.completed_tasks')}</p>
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
          <h3 className="text-lg font-medium text-gray-900">{t('home.calendar.title')}</h3>
          <p className="text-sm text-gray-600 mt-1">{t('home.calendar.description')}</p>
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
            {t('home.calendar.short_sessions_info')}
          </p>
        </div>
        <div className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8 p-6">{t('home.loading_error')}</div>
          ) : (
            <ErrorBoundary>
              <div className="p-6">
                <WeeklyCalendar currentDate={currentWeek} weeklyTasks={weeklyTasks} />
              </div>
            </ErrorBoundary>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      {dashboardData?.recentSessions && dashboardData.recentSessions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{t('home.recent_sessions')}</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dashboardData.recentSessions.slice(0, 5).map((session: any) => (
                <div
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  key={session.id}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {session.description || t('home.session_without_description')}
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
      {environment.APP_ENV === 'development' && dashboardData && (
        <React.Suspense fallback={null}>
          <DashboardDebug dashboardData={dashboardData} />
        </React.Suspense>
      )}
    </div>
  )
}
