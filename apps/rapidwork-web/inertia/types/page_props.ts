// Types for page props - aligned with domain entities

import type { BackendWorkSession } from './backend'

import { DomainWithSubdomainsDto } from '../../app/core/main/view_models/domains/domain_dto'

// Base props that all pages receive
export interface BasePageProps {
  errors?: Record<string, string[]>
  flash?: {
    error?: string
    info?: string
    success?: string
    warning?: string
  }
  user?: User
}

// Home page props
export interface HomePageProps extends BasePageProps {
  recentSessions: BackendWorkSession[]
  todayStats: {
    completedTasks: number
    sessionCount: number
    totalDuration: number
  }
  weeklyData: {
    date: string
    duration: number
  }[]
}

// Auth page props
export interface LoginPageProps extends BasePageProps {
  redirectTo?: string
}

// Error page props
export interface NotFoundPageProps extends BasePageProps {
  requestedPath?: string
}

export interface RegisterPageProps extends BasePageProps {}

export interface ServerErrorPageProps extends BasePageProps {
  errorCode?: number
  errorMessage?: string
}

// Task selection page props
export interface TaskSelectionPageProps extends BasePageProps {
  domains: DomainWithSubdomainsDto[]
}

export interface User {
  createdAt: string
  email: string
  id: string
  name: string
  updatedAt: string
}

// Calendar page props
export interface WeeklyCalendarPageProps extends BasePageProps {
  selectedWeek?: string
  weekData: {
    date: string
    sessions: BackendWorkSession[]
    totalDuration: number
  }[]
}
