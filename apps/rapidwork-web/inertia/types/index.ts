// Re-export all types for easy importing
export * from './backend'
// Type TimerEntry compatible (alias vers BackendWorkSession)
export type { BackendWorkSession as TimerEntry } from './backend'
export * from './mock'
export * from './page_props'

// Types pour le contexte Timer (structure simplifiée)
export interface TimerState {
  currentDescription: null | string
  currentDomain: null | string
  currentSubdomain: null | string
  currentTaskId: null | string
  currentTaskName: null | string
  elapsed: number
  pausedTime: number
  startTime: Date | null
  status: 'idle' | 'paused' | 'running'
}
