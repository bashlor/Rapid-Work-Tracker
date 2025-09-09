export interface DailySessionDataViewModel {
  date: string
  sessions: SessionViewModel[]
  totalDuration: number
}

export interface DomainViewModel {
  id: string
  name: string
}

export interface GetUserDataDashboardViewModel {
  activeTasks: TaskWithDetailsViewModel[]
  dailySessions: DailySessionDataViewModel[]
  recentSessions: SessionViewModel[]
  userId: string
  userName: string
  weekEndDate: string
  weeklyStats: WeeklyStatsViewModel
  weekStartDate: string
}

export interface SessionViewModel {
  description?: string
  duration: number
  endTime: string
  id: string
  startTime: string
  taskId: string
  userId: string
}

export interface SubDomainViewModel {
  id: string
  name: string
}

export interface TaskViewModel {
  createdAt: string
  description: string
  domainId: null | string
  id: string
  status: string
  subDomainId: null | string
  title: string
  userId: string
}

export interface TaskWithDetailsViewModel {
  domain?: DomainViewModel
  sessionsCount: number
  subDomain?: SubDomainViewModel
  task: TaskViewModel
  totalDuration: number
}

export interface WeeklyStatsViewModel {
  activeTasksCount: number
  averageSessionDuration: number
  completedTasksCount: number
  sessionCount: number
  totalDuration: number
}

export function toGetUserDataDashboardViewModel(data: any): GetUserDataDashboardViewModel {
  return {
    activeTasks: data.activeTasks,
    dailySessions: data.dailySessions,
    recentSessions: data.recentSessions,
    userId: data.userId,
    userName: data.userName,
    weekEndDate: data.weekEndDate,
    weeklyStats: data.weeklyStats,
    weekStartDate: data.weekStartDate,
  }
}
