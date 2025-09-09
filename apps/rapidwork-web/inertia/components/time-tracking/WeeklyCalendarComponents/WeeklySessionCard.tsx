import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  calculateTaskPosition,
  formatTime,
  getDomainColor,
  type CalendarTask,
} from '@/utils/calendar_utils'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

interface WeeklySessionCardProps {
  task: CalendarTask
  firstHour: number
  onTaskClick?: (task: CalendarTask) => void
}

const WeeklySessionCard = ({ task, firstHour, onTaskClick }: WeeklySessionCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [overlayPosition, setOverlayPosition] = useState<'left' | 'right'>('right')

  const { top, height } = calculateTaskPosition(task.startTime, task.endTime, firstHour)

  // Couleur basée sur le domaine
  const domainColor = getDomainColor(task.domain, false)

  // Calculer la largeur et la position pour les chevauchements
  const width = task.columnCount ? `${100 / task.columnCount}%` : '100%'
  const left = task.column ? `${(task.column * 100) / task.columnCount!}%` : '0'

  const handleClick = () => {
    onTaskClick?.(task)
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true)
    // Déterminer la position de l'overlay en fonction de la position dans la fenêtre
    const rect = e.currentTarget.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const spaceOnRight = viewportWidth - rect.right
    setOverlayPosition(spaceOnRight < 320 ? 'left' : 'right') // 320px est la largeur approximative de l'overlay
  }

  return (
    <div
      className={cn(
        'absolute rounded-md px-2 py-1 text-xs font-medium flex flex-col justify-start overflow-hidden cursor-pointer transition-all duration-200 border-2',
        isHovered && 'shadow-lg scale-[1.02] z-10'
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        width,
        left,
        backgroundColor: '#f0f9ff',
        borderColor: domainColor,
        color: '#374151',
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Nom de la tâche */}
      <div className="font-semibold truncate mb-1" title={task.title}>
        {task.title}
      </div>

      {/* Horaires de la session */}
      <div className="text-[10px] text-gray-600 mb-1 flex items-center">
        <Clock className="h-3 w-3 inline mr-1" />
        {formatTime(task.startTime)} - {formatTime(task.endTime)}
      </div>

      {/* Domaine et sous-domaine */}
      <div className="text-[10px] flex items-center gap-1">
        <Badge
          variant="outline"
          className="text-[9px] px-1 py-0 h-auto"
          style={{ borderColor: domainColor, color: domainColor }}
        >
          {task.domain}
        </Badge>
        {task.subdomain && (
          <Badge
            variant="outline"
            className="text-[9px] px-1 py-0 h-auto text-gray-500"
          >
            {task.subdomain}
          </Badge>
        )}
      </div>

      {/* Overlay au survol */}
      {isHovered && (
        <div 
          className={cn(
            "absolute top-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px]",
            overlayPosition === 'right' ? 'left-full ml-2' : 'right-full mr-2'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="space-y-2">
            <div className="font-semibold text-sm text-gray-900">{task.title}</div>
            
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3 text-gray-500" />
              <span className="text-gray-600">
                {formatTime(task.startTime)} - {formatTime(task.endTime)}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className="text-[10px] px-1 py-0 h-auto"
                style={{ backgroundColor: domainColor, color: 'white' }}
              >
                {task.domain}
              </Badge>
              {task.subdomain && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 h-auto text-gray-500"
                >
                  {task.subdomain}
                </Badge>
              )}
            </div>

            {task.description && (
              <div className="text-xs text-gray-600 border-t pt-2">
                {task.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default WeeklySessionCard
