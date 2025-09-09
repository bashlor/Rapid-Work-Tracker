import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  calculateDynamicHours,
  getWeekDays,
  formatDay,
  formatDayNumber,
  checkIsToday,
  organizeCalendarTasks,
  type CalendarTask,
} from '@/utils/calendar_utils'
import WeeklySessionCard from './WeeklySessionCard'

interface WeeklyCalendarProps {
  currentDate: Date
  tasks: CalendarTask[]
  onTaskClick?: (task: CalendarTask) => void
  onCellClick?: (day: Date, hour: number) => void
}

const WeeklyCalendar = ({ currentDate, tasks, onTaskClick, onCellClick }: WeeklyCalendarProps) => {
  const weekDays = getWeekDays(currentDate)

  // Calculer les heures dynamiques basées sur les tâches
  const { hoursArray, firstHour } = useMemo(() => {
    const hoursRange = calculateDynamicHours(tasks)
    const hoursArray = Array.from(
      { length: hoursRange.lastHour - hoursRange.firstHour + 1 },
      (_, i) => hoursRange.firstHour + i
    )
    return { hoursArray, firstHour: hoursRange.firstHour }
  }, [tasks])

  // Organiser les tâches pour gérer les chevauchements
  const organizedTasks = useMemo(() => {
    return organizeCalendarTasks(tasks)
  }, [tasks])

  // Gérer le clic sur une tâche
  const handleTaskClick = (task: CalendarTask) => {
    onTaskClick?.(task)
  }

  // Gérer le clic sur une cellule vide
  const handleCellClick = (day: Date, hour: number) => {
    onCellClick?.(day, hour)
  }

  return (
    <div className="w-full overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
        <div className="time-column"></div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              'day-column p-2 text-center border-l',
              checkIsToday(day) && 'bg-blue-50'
            )}
          >
            <div className="text-sm uppercase font-medium text-gray-500">
              {formatDay(day)}
            </div>
            <div className={cn(
              'text-2xl font-medium mt-1',
              checkIsToday(day) ? 'text-blue-500' : 'text-gray-700'
            )}>
              {formatDayNumber(day)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="calendar-grid-container relative grid grid-cols-[60px_repeat(7,1fr)] overflow-y-auto no-scrollbar">
        {/* Time labels */}
        <div className="time-column">
          {hoursArray.map((hour) => (
            <div key={hour} className="h-[60px] text-right pr-2 text-xs text-gray-500 font-medium relative">
              <span className="absolute top-[-9px] right-2">
                {hour === 12 ? '12:00 PM' : hour < 12 ? `${hour}:00 AM` : `${hour-12}:00 PM`}
              </span>
            </div>
          ))}
        </div>
        
        {/* Day columns */}
        {weekDays.map((day, dayIndex) => (
          <div
            key={dayIndex}
            className={cn(
              'day-column relative border-l',
              checkIsToday(day) && 'bg-blue-50'
            )}
          >
            {/* Hour grid lines with click handler */}
            {hoursArray.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                onClick={() => handleCellClick(day, hour)}
              ></div>
            ))}
            
            {/* Tasks for this day */}
            {(organizedTasks.get(dayIndex) || [])
              .map((task: CalendarTask) => (
                <WeeklySessionCard 
                  key={task.id} 
                  task={task} 
                  firstHour={firstHour}
                  onTaskClick={handleTaskClick} 
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeeklyCalendar
