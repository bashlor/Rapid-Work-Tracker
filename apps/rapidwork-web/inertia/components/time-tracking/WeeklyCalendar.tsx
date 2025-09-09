import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from '@/utils/datetime'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  startTime?: string
  endTime?: string
  time?: string
  name: string
  domain: string
  subdomain: string
  date?: string
}

interface WeeklyCalendarProps {
  date: Date
  tasks: Task[]
}

const WeeklyCalendar = ({ date, tasks }: WeeklyCalendarProps) => {
  const startDate = startOfWeek(date, { weekStartsOn: 1 })
  const endDate = endOfWeek(date, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: startDate, end: endDate })

  const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 8h à 21h

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => {
      let startTime = task.startTime

      // If startTime doesn't exist but time does, extract startTime from time
      if (!startTime && task.time) {
        startTime = task.time.split(' - ')[0]
      }

      // Skip this task if we still don't have a valid startTime
      if (!startTime) return false

      const [taskStartHour] = startTime.split(':').map(Number)

      // Check if the task is on the given day
      const taskDate = task.date ? new Date(task.date) : null

      return taskDate && isSameDay(taskDate, day) && taskStartHour >= 8 && taskStartHour <= 21
    })
  }

  const getTaskPosition = (task: Task) => {
    let startTime = task.startTime

    // If startTime doesn't exist but time does, extract startTime from time
    if (!startTime && task.time) {
      startTime = task.time.split(' - ')[0]
    }

    if (!startTime) return '0px' // Fallback

    const [hours, minutes] = startTime.split(':').map(Number)
    return `${(hours - 8) * 60 + minutes}px`
  }

  const getTaskHeight = (task: Task) => {
    let startTime = task.startTime
    let endTime = task.endTime

    // If startTime/endTime don't exist but time does, extract them from time
    if ((!startTime || !endTime) && task.time) {
      const [start, end] = task.time.split(' - ')
      startTime = startTime || start
      endTime = endTime || end
    }

    if (!startTime || !endTime) return '60px' // Default height if we can't calculate

    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    const durationInMinutes = (endHours - startHours) * 60 + (endMinutes - startMinutes)
    return `${durationInMinutes}px`
  }

  return (
    <div className="mt-6 overflow-x-auto overflow-y-visible">
      <div className="min-w-[800px] pb-4">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-6 gap-4 mb-2 font-medium">
          {weekDays.slice(0, 6).map((day) => (
            <div key={day.toString()} className="text-center">
              {format(day, 'EEEE')}
            </div>
          ))}
        </div>

        {/* Grille du calendrier avec légende des heures */}
        <div className="flex">
          {/* Légende des heures */}
          <div className="w-10 relative min-h-[800px] pr-2">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full text-right"
                style={{ top: `${(hour - 8) * 60}px` }}
              >
                <span className="text-xs text-muted-foreground">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="flex-1 grid grid-cols-6 gap-4 relative border rounded-lg bg-background">
            {weekDays.slice(0, 6).map((day) => (
              <div key={day.toString()} className="relative min-h-[800px] border-r last:border-r-0">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-border"
                    style={{ top: `${(hour - 8) * 60}px` }}
                  />
                ))}

                {getTasksForDay(day).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'absolute left-1 right-1 p-2 rounded bg-primary/90 text-primary-foreground',
                      'hover:bg-primary transition-colors overflow-hidden'
                    )}
                    style={{
                      top: getTaskPosition(task),
                      height: getTaskHeight(task),
                      maxHeight: 'calc(100% - ' + getTaskPosition(task) + ')',
                    }}
                  >
                    <div className="text-sm font-medium truncate">
                      {task.id} - {task.name}
                    </div>
                    <div className="text-xs opacity-90 truncate">
                      {task.time ||
                        (task.startTime && task.endTime
                          ? `${task.startTime} - ${task.endTime}`
                          : 'Horaire non spécifié')}
                    </div>
                    <div className="text-xs mt-1 opacity-75 truncate">
                      {task.domain} - {task.subdomain}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyCalendar
