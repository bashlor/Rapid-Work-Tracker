import React, { useEffect, useState } from 'react'

import type { CalendarTask } from '@/utils/calendar_utils'

import SessionDetailPanel from './SessionDetailPanel'
import WeeklyCalendarInternal from './WeeklyCalendarInternal'

interface WeeklyCalendarProps {
  currentDate?: Date
  weeklyTasks?: CalendarTask[]
}

const WeeklyCalendar = ({ currentDate: propCurrentDate, weeklyTasks }: WeeklyCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(propCurrentDate || new Date())
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Synchroniser avec la prop currentDate
  useEffect(() => {
    if (propCurrentDate) {
      setCurrentDate(propCurrentDate)
    }
  }, [propCurrentDate])

  // Charger les tâches depuis les props
  useEffect(() => {
    if (weeklyTasks) {
      setTasks(weeklyTasks)
    } else {
      setTasks([])
    }
  }, [weeklyTasks, propCurrentDate]) // Ajouter propCurrentDate pour forcer le rechargement

  // Gérer le clic sur une tâche
  const handleTaskClick = (task: CalendarTask) => {
    setSelectedTask(task)
    setIsPanelOpen(true)
  }

  // Gérer la fermeture du panneau
  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setSelectedTask(null)
  }

  // Gérer le clic sur une cellule vide
  const handleCellClick = (_day: Date, _hour: number) => {
    // Pour l'instant, ne rien faire
  }

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <WeeklyCalendarInternal
        currentDate={currentDate}
        onCellClick={handleCellClick}
        onTaskClick={handleTaskClick}
        tasks={tasks}
      />

      {/* Session Detail Panel */}
      <SessionDetailPanel isOpen={isPanelOpen} onClose={handleClosePanel} task={selectedTask} />
    </div>
  )
}

export default WeeklyCalendar
