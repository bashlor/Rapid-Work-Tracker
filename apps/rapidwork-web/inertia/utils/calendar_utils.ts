import {
  addDays,
  differenceInMinutes,
  format,
  isToday,
  parseISO,
  parseTimeToMinutes,
  startOfWeek,
} from './datetime'

// Types
export interface CalendarSession {
  date: string
  description?: string
  duration: number
  endTime: string
  id: string
  startTime: string
  taskId: string
}

export interface CalendarTask {
  assignedTo?: string
  column?: number
  columnCount?: number
  date?: string
  day?: number // Pour la compatibilité avec MockWeeklyTask
  description?: string
  domain: string
  endTime: string
  id: string
  priority?: 'high' | 'low' | 'medium'
  sessions?: CalendarSession[]
  startTime: string
  status: 'cancelled' | 'completed' | 'in-progress' | 'planned'
  subdomain?: string
  title: string
}

// Constantes
export const HOUR_HEIGHT = 60
export const FIRST_HOUR = 6
export const LAST_HOUR = 23

// Calcul de durée entre deux dates ISO
export function calculateDurationBetweenDates(startTime: string, endTime: string): number {
  try {
    const start = parseISO(startTime)
    const end = parseISO(endTime)
    return differenceInMinutes(end, start) * 60 // Retourner en secondes
  } catch {
    return 0
  }
}

// Calcul des heures dynamiques pour le calendrier
export function calculateDynamicHours(tasks: CalendarTask[]): {
  firstHour: number
  lastHour: number
} {
  if (tasks.length === 0) {
    return { firstHour: FIRST_HOUR, lastHour: LAST_HOUR }
  }

  let minHour = 24
  let maxHour = 0

  tasks.forEach((task) => {
    const startHour = parseTimeToMinutes(task.startTime) / 60
    const endHour = parseTimeToMinutes(task.endTime) / 60
    minHour = Math.min(minHour, Math.floor(startHour))
    maxHour = Math.max(maxHour, Math.ceil(endHour))
  })

  return {
    firstHour: Math.max(0, minHour - 1),
    lastHour: Math.min(23, maxHour + 1),
  }
}

// Calcul de position
export function calculateTaskPosition(startTime: string, endTime: string, firstHour: number) {
  const start = parseTimeToMinutes(startTime)
  const end = parseTimeToMinutes(endTime)

  const startOffset = (start - firstHour * 60) * (HOUR_HEIGHT / 60)
  const duration = end - start
  const height = Math.max(20, duration * (HOUR_HEIGHT / 60))

  return {
    height,
    top: Math.max(0, startOffset),
  }
}

// Calcul de durée totale des sessions
export function calculateTotalSessionDuration(task: CalendarTask): number {
  if (!task.sessions || task.sessions.length === 0) {
    return 0
  }

  return task.sessions.reduce((total, session) => {
    // Si la durée est déjà fournie
    if (session.duration !== undefined && session.duration !== null) {
      // La durée peut être en minutes ou en secondes selon la source
      // Si c'est un très grand nombre (> 86400 = 1 jour en secondes), c'est probablement en millisecondes
      // Si c'est entre 1440 et 86400, c'est probablement en secondes
      // Si c'est < 1440, c'est probablement en minutes
      if (session.duration > 86400) {
        // Probablement en millisecondes, on les garde
        return total + session.duration
      } else if (session.duration > 1440) {
        // Probablement en secondes, convertir en millisecondes
        return total + session.duration * 1000
      } else {
        // Probablement en minutes, convertir en millisecondes
        return total + session.duration * 60000
      }
    }

    // Sinon calculer depuis les heures de début/fin
    try {
      const start = parseISO(session.startTime)
      const end = parseISO(session.endTime)
      const durationMinutes = differenceInMinutes(end, start)
      return total + durationMinutes * 60000
    } catch {
      return total
    }
  }, 0)
}

// Vérifier si une date est aujourd'hui
export function checkIsToday(date: Date): boolean {
  return isToday(date)
}

// Conversion de durée en secondes vers un format lisible
export function convertSecondsToReadableTime(seconds: number): string {
  // Si le nombre est très grand, c'est probablement en millisecondes
  let totalSeconds = seconds
  if (seconds > 86400) {
    totalSeconds = Math.floor(seconds / 1000)
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours === 0) {
    return `${minutes} min`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}min`
}

// Détection de chevauchement
export function detectOverlaps(tasks: CalendarTask[]): CalendarTask[] {
  // Trier les tâches par heure de début
  const sortedTasks = [...tasks].sort((a, b) => {
    const aStart = parseTimeToMinutes(a.startTime)
    const bStart = parseTimeToMinutes(b.startTime)
    return aStart - bStart
  })

  // Détecter les groupes de tâches qui se chevauchent
  const groups: CalendarTask[][] = []
  let currentGroup: CalendarTask[] = []

  sortedTasks.forEach((task) => {
    const taskStart = parseTimeToMinutes(task.startTime)
    const taskEnd = parseTimeToMinutes(task.endTime)

    // Vérifier si la tâche chevauche avec le groupe actuel
    const overlapsWithGroup = currentGroup.some((groupTask) => {
      const groupStart = parseTimeToMinutes(groupTask.startTime)
      const groupEnd = parseTimeToMinutes(groupTask.endTime)
      return taskStart < groupEnd && taskEnd > groupStart
    })

    if (overlapsWithGroup || currentGroup.length === 0) {
      currentGroup.push(task)
    } else {
      if (currentGroup.length > 0) {
        groups.push([...currentGroup])
      }
      currentGroup = [task]
    }
  })

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  // Assigner les colonnes aux tâches
  const tasksWithColumns: CalendarTask[] = []

  groups.forEach((group) => {
    const columnCount = group.length
    group.forEach((task, index) => {
      tasksWithColumns.push({
        ...task,
        column: index,
        columnCount,
      })
    })
  })

  return tasksWithColumns
}

// Formatage du jour
export function formatDay(date: Date): string {
  return format(date, 'EEEE')
}

// Formatage du numéro du jour
export function formatDayNumber(date: Date): string {
  return format(date, 'd')
}

// Fonctions de formatage
// Re-export duration formatting functions from datetime.ts to maintain compatibility
export { formatDuration, formatDurationFromMinutes, formatDurationFromSeconds } from './datetime'

// Formatage du mois
export function formatMonth(date: Date): string {
  return format(date, 'MMMM yyyy')
}

export function formatTime(time: string): string {
  // Si c'est déjà au format HH:mm, on le retourne tel quel
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time
  }

  // Sinon on parse la date ISO et on formate
  try {
    const date = parseISO(time)
    return format(date, 'HH:mm')
  } catch {
    return time
  }
}

// Formatage de la semaine
export function formatWeek(date: Date): string {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)

  const startMonth = format(weekStart, 'MMM')
  const endMonth = format(weekEnd, 'MMM')
  const startDay = format(weekStart, 'd')
  const endDay = format(weekEnd, 'd')
  const year = format(weekEnd, 'yyyy')

  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} ${endMonth} ${year}`
  } else {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`
  }
}

// Couleurs
export function getDomainColor(domain: string, light: boolean = false): string {
  const colors: Record<string, { light: string; normal: string }> = {
    Administratif: { light: '#FEE2E2', normal: '#EF4444' },
    default: { light: '#F3F4F6', normal: '#6B7280' },
    Formation: { light: '#FEF3C7', normal: '#F59E0B' },
    Gestion: { light: '#D1FAE5', normal: '#10B981' },
    Logiciel: { light: '#DBEAFE', normal: '#3B82F6' },
    Personnel: { light: '#EDE9FE', normal: '#8B5CF6' },
  }

  const colorSet = colors[domain] || colors.default
  return light ? colorSet.light : colorSet.normal
}

export function getStatusColor(status: string, light: boolean = false): string {
  const colors: Record<string, { light: string; normal: string }> = {
    'cancelled': { light: '#FEE2E2', normal: '#EF4444' },
    'completed': { light: '#D1FAE5', normal: '#10B981' },
    'default': { light: '#F3F4F6', normal: '#6B7280' },
    'in-progress': { light: '#DBEAFE', normal: '#3B82F6' },
    'planned': { light: '#F3F4F6', normal: '#6B7280' },
  }

  const colorSet = colors[status] || colors.default
  return light ? colorSet.light : colorSet.normal
}

export function getTextColor(backgroundColor: string): string {
  // Convertir la couleur hex en RGB
  const hex = backgroundColor.replace('#', '')
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)

  // Calculer la luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Retourner noir ou blanc selon la luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// Génération des jours de la semaine
export function getWeekDays(weekStart?: Date): Date[] {
  const start = weekStart
    ? startOfWeek(weekStart, { weekStartsOn: 1 })
    : startOfWeek(new Date(), { weekStartsOn: 1 })

  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

// Organisation des tâches par jour pour le calendrier
export function organizeCalendarTasks(tasks: CalendarTask[]): Map<number, CalendarTask[]> {
  const tasksByDay = new Map<number, CalendarTask[]>()

  tasks.forEach((task) => {
    // Si la tâche a un jour défini, l'utiliser
    const day = task.day || 1 // Par défaut lundi

    if (!tasksByDay.has(day)) {
      tasksByDay.set(day, [])
    }
    tasksByDay.get(day)!.push(task)
  })

  // Détecter les chevauchements pour chaque jour
  tasksByDay.forEach((dayTasks, day) => {
    const tasksWithOverlaps = detectOverlaps(dayTasks)
    tasksByDay.set(day, tasksWithOverlaps)
  })

  return tasksByDay
}
