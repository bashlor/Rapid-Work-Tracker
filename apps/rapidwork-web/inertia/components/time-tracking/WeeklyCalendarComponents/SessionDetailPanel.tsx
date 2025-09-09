import { Badge } from '@/components/ui/badge'
import { X, Clock, CheckCircle, Play, Pause } from 'lucide-react'
import type { CalendarTask } from '@/utils/calendar_utils'
import {
  getDomainColor,
  getStatusColor,
} from '@/utils/calendar_utils'

interface SessionDetailPanelProps {
  task: CalendarTask | null
  isOpen: boolean
  onClose: () => void
}

const SessionDetailPanel = ({ task, isOpen, onClose }: SessionDetailPanelProps) => {
  if (!isOpen || !task) return null

  const domainColor = getDomainColor(task.domain, false)
  const statusColor = getStatusColor(task.status, false)

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Pause className="h-4 w-4 text-gray-500" />
    }
  }

  const formatSessionDuration = (session: any) => {
    if (session.duration) {
      const hours = Math.floor(session.duration / (1000 * 60 * 60))
      const minutes = Math.floor((session.duration % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m`
    }
    // Fallback: calculer à partir des heures
    const start = new Date(session.startTime)
    const end = new Date(session.endTime)
    const diffMs = end.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <>
      {/* Side panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Détails de la session</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Nom de la tâche */}
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h4>
          </div>

          {/* Domaine et Sous-domaine */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              style={{ backgroundColor: domainColor, color: 'white' }}
              className="text-white"
            >
              {task.domain}
            </Badge>
            {task.subdomain && (
              <Badge variant="outline">
                {task.subdomain}
              </Badge>
            )}
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-sm font-medium" style={{ color: statusColor }}>
                {task.status === 'completed' ? 'Terminée' : 
                 task.status === 'in-progress' ? 'En cours' : 
                 task.status === 'planned' ? 'Planifiée' : 'Annulée'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h5 className="font-medium text-gray-900 mb-1">Description</h5>
            <p className="text-gray-600 text-sm">{task.description}</p>
          </div>

          {/* Horaires */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{task.startTime} - {task.endTime}</span>
          </div>

          {/* Sessions de travail */}
          {task.sessions && task.sessions.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Sessions de travail</h5>
              <div className="space-y-2">
                {task.sessions.map((session) => (
                  <div key={session.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {formatDateTime(session.startTime)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatSessionDuration(session)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      Fin: {formatDateTime(session.endTime)}
                    </div>
                    {session.description && (
                      <p className="text-xs text-gray-600">{session.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SessionDetailPanel
