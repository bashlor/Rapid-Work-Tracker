import { useState, useEffect } from 'react'
import WeeklyCalendar from './WeeklyCalendarComponents/WeeklyCalendar'
import SessionDetailPanel from './WeeklyCalendarComponents/SessionDetailPanel'
import type { CalendarTask } from '@/utils/calendar_utils'

interface WeeklyCalendarViewProps {
  weeklyTasks?: CalendarTask[]
  currentDate?: Date
}

const WeeklyCalendarView = ({ weeklyTasks, currentDate: propCurrentDate }: WeeklyCalendarViewProps) => {
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
      <WeeklyCalendar
        currentDate={currentDate}
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onCellClick={handleCellClick}
      />
      
      {/* Session Detail Panel */}
      <SessionDetailPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  )
}

export default WeeklyCalendarView
