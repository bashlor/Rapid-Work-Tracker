import { DateTime } from 'luxon'
import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react'

// Interface locale pour les entrées de timer (indépendante des mocks)
export interface TimerEntry {
  date: string // Format: 'yyyy-MM-dd'
  description: string
  domain: string
  endTime: string // ISO string
  id: string
  startTime: string // ISO string
  subdomain: string
  taskId: string
  userId: string
}

type TimerAction =
  | { payload: TimerState; type: 'LOAD_STATE'; }
  | {
      payload: {
        description: string
        domain: string
        subdomain: string
        taskId: string
        taskName: string
      }
      type: 'START_TIMER'
    }
  | { payload: { elapsed: number }; type: 'UPDATE_ELAPSED'; }
  | { payload: { pauseDuration: number }; type: 'RESUME_TIMER'; }
  | { payload: { pauseStartTime: Date }; type: 'PAUSE_TIMER'; }
  | { type: 'STOP_TIMER' }

interface TimerState {
  currentDescription: null | string
  currentDomain: null | string
  currentSubdomain: null | string
  currentTaskId: null | string
  currentTaskName: null | string
  elapsed: number
  pausedTime: number // Temps total en pause (en millisecondes)
  startTime: Date | null
  status: TimerStatus
}

type TimerStatus = 'idle' | 'paused' | 'running'

const initialState: TimerState = {
  currentDescription: null,
  currentDomain: null,
  currentSubdomain: null,
  currentTaskId: null,
  currentTaskName: null,
  elapsed: 0,
  pausedTime: 0,
  startTime: null,
  status: 'idle',
}

interface TimerContextType {
  formatElapsedTime: (elapsed: number) => string
  pauseTimer: () => void
  resumeTimer: () => void
  startTimer: (
    taskId: string,
    taskName: string,
    domain: string,
    subdomain: string,
    description: string
  ) => void
  state: TimerState
  stopTimer: () => Promise<void>
}

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload
    case 'PAUSE_TIMER':
      return {
        ...state,
        status: 'paused',
      }
    case 'RESUME_TIMER':
      return {
        ...state,
        pausedTime: state.pausedTime + action.payload.pauseDuration,
        status: 'running',
      }
    case 'START_TIMER':
      return {
        ...state,
        currentDescription: action.payload.description,
        currentDomain: action.payload.domain,
        currentSubdomain: action.payload.subdomain,
        currentTaskId: action.payload.taskId,
        currentTaskName: action.payload.taskName,
        elapsed: 0,
        pausedTime: 0,
        startTime: new Date(),
        status: 'running',
      }
    case 'STOP_TIMER':
      return {
        ...initialState,
      }
    case 'UPDATE_ELAPSED':
      return {
        ...state,
        elapsed: action.payload.elapsed,
      }
    default:
      return state
  }
}

const TimerContext = createContext<null | TimerContextType>(null)

const STORAGE_KEY = 'timerState'
const TIMER_ENTRIES_KEY = 'timerEntries'

// Service simple pour sauvegarder les entrées de timer
const saveTimerEntry = async (entry: TimerEntry): Promise<void> => {
  try {
    const existingEntries = JSON.parse(localStorage.getItem(TIMER_ENTRIES_KEY) || '[]')
    const updatedEntries = [...existingEntries, entry]
    localStorage.setItem(TIMER_ENTRIES_KEY, JSON.stringify(updatedEntries))
    console.log('Timer entry saved:', entry)
  } catch (error) {
    console.error('Failed to save timer entry to localStorage:', error)
    throw error
  }
}

// Fonction utilitaire pour récupérer les entrées sauvegardées
export const getTimerEntries = (): TimerEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(TIMER_ENTRIES_KEY) || '[]')
  } catch (error) {
    console.error('Failed to load timer entries from localStorage:', error)
    return []
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState)
  const pauseStartRef = useRef<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fonction pour calculer le temps écoulé précis
  const calculateElapsed = useCallback((startTime: Date, pausedTime: number): number => {
    if (!startTime) return 0
    const now = new Date()
    const totalTime = now.getTime() - startTime.getTime()
    return Math.max(0, totalTime - pausedTime)
  }, [])

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        // Convert startTime back to Date object if it exists
        if (parsedState.startTime) {
          parsedState.startTime = new Date(parsedState.startTime)
        }
        dispatch({ payload: parsedState, type: 'LOAD_STATE' })
      } catch (error) {
        console.error('Failed to load timer state:', error)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      ...state,
      startTime: state.startTime?.toISOString() || null,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  }, [state])

  // Timer tick effect avec calcul précis
  useEffect(() => {
    if (state.status === 'running' && state.startTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = calculateElapsed(state.startTime!, state.pausedTime)
        dispatch({ payload: { elapsed }, type: 'UPDATE_ELAPSED' })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.status, state.startTime, state.pausedTime, calculateElapsed])

  const startTimer = (
    taskId: string,
    taskName: string,
    domain: string,
    subdomain: string,
    description: string
  ) => {
    dispatch({ payload: { description, domain, subdomain, taskId, taskName }, type: 'START_TIMER' })
  }

  const pauseTimer = () => {
    if (state.status === 'running') {
      pauseStartRef.current = new Date()
      dispatch({ payload: { pauseStartTime: new Date() }, type: 'PAUSE_TIMER' })
    }
  }

  const resumeTimer = () => {
    if (state.status === 'paused' && pauseStartRef.current) {
      const now = new Date()
      const pauseDuration = now.getTime() - pauseStartRef.current.getTime()
      dispatch({ payload: { pauseDuration }, type: 'RESUME_TIMER' })
      pauseStartRef.current = null
    }
  }

  const stopTimer = async () => {
    if (state.status !== 'idle' && state.startTime && state.currentTaskId) {
      // Save the timer entry
      const entry: TimerEntry = {
        // Store a pure local date for the entry day
        date: DateTime.fromJSDate(state.startTime).toFormat('yyyy-LL-dd'),
        description: state.currentDescription || '',
        domain: state.currentDomain || '',
        endTime: new Date().toISOString(),
        id: crypto.randomUUID(),
        startTime: state.startTime.toISOString(),
        subdomain: state.currentSubdomain || '',
        taskId: state.currentTaskId,
        userId: 'current-user', // Replace with actual user ID when auth is integrated
      }

      try {
        await saveTimerEntry(entry)
      } catch (error) {
        console.error('Failed to save timer entry:', error)
      }
    }

    dispatch({ type: 'STOP_TIMER' })
  }

  const formatElapsedTime = (elapsed: number): string => {
    const hours = Math.floor(elapsed / (1000 * 60 * 60))
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <TimerContext.Provider
      value={{
        formatElapsedTime,
        pauseTimer,
        resumeTimer,
        startTimer,
        state,
        stopTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}
