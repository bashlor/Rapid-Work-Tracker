import React, { useMemo } from 'react'

import { cn } from '@/lib/utils'
import {
  calculateDynamicHours,
  type CalendarTask,
  checkIsToday,
  formatDay,
  formatDayNumber,
  getWeekDays,
  organizeCalendarTasks,
} from '@/utils/calendar_utils'

import WeeklySessionCard from './WeeklySessionCard'

interface WeeklyCalendarInternalProps {
  currentDate: Date
  onCellClick?: (day: Date, hour: number) => void
  onTaskClick?: (task: CalendarTask) => void
  tasks: CalendarTask[]
}

const WeeklyCalendarInternal = ({
  currentDate,
  onCellClick,
  onTaskClick,
  tasks,
}: WeeklyCalendarInternalProps) => {
  const weekDays = getWeekDays(currentDate)

  // Calculer les heures dynamiques basées sur les tâches
  const { firstHour, hoursArray } = useMemo(() => {
    const hoursRange = calculateDynamicHours(tasks)
    const hoursArray = Array.from(
      { length: hoursRange.lastHour - hoursRange.firstHour + 1 },
      (_, i) => hoursRange.firstHour + i
    )
    return { firstHour: hoursRange.firstHour, hoursArray }
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
            className={cn('day-column p-2 text-center border-l', checkIsToday(day) && 'bg-blue-50')}
            key={index}
          >
            <div className="text-sm uppercase font-medium text-gray-500">{formatDay(day)}</div>
            <div
              className={cn(
                'text-2xl font-medium mt-1',
                checkIsToday(day) ? 'text-blue-500' : 'text-gray-700'
              )}
            >
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
            <div
              className="h-[60px] text-right pr-2 text-xs text-gray-500 font-medium relative"
              key={hour}
            >
              <span className="absolute top-[-9px] right-2">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day, dayIndex) => (
          <div
            className={cn('day-column relative border-l', checkIsToday(day) && 'bg-blue-50')}
            key={dayIndex}
          >
            {/* Hour grid lines with click handler */}
            {hoursArray.map((hour) => (
              <div
                className="h-[60px] border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                key={hour}
                onClick={() => handleCellClick(day, hour)}
              ></div>
            ))}

            {/* Tasks for this day */}
            {(organizedTasks.get(dayIndex) || []).map((task: CalendarTask) => (
              <WeeklySessionCard
                firstHour={firstHour}
                key={task.id}
                onTaskClick={handleTaskClick}
                task={task}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeeklyCalendarInternal
