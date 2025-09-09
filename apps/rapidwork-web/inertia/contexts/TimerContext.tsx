import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { TimerEntry, timerService } from '@/lib/mock_data'
import { DateTime } from 'luxon'

type TimerStatus = 'idle' | 'running' | 'paused'

interface TimerState {
  status: TimerStatus
  startTime: Date | null
  pausedTime: number // Temps total en pause (en millisecondes)
  elapsed: number
  currentTaskId: string | null
  currentTaskName: string | null
  currentDomain: string | null
  currentSubdomain: string | null
  currentDescription: string | null
}

type TimerAction =
  | {
      type: 'START_TIMER'
      payload: {
        taskId: string
        taskName: string
        domain: string
        subdomain: string
        description: string
      }
    }
  | { type: 'PAUSE_TIMER'; payload: { pauseStartTime: Date } }
  | { type: 'RESUME_TIMER'; payload: { pauseDuration: number } }
  | { type: 'STOP_TIMER' }
  | { type: 'UPDATE_ELAPSED'; payload: { elapsed: number } }
  | { type: 'LOAD_STATE'; payload: TimerState }

const initialState: TimerState = {
  status: 'idle',
  startTime: null,
  pausedTime: 0,
  elapsed: 0,
  currentTaskId: null,
  currentTaskName: null,
  currentDomain: null,
  currentSubdomain: null,
  currentDescription: null,
}

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START_TIMER':
      return {
        ...state,
        status: 'running',
        startTime: new Date(),
        pausedTime: 0,
        elapsed: 0,
        currentTaskId: action.payload.taskId,
        currentTaskName: action.payload.taskName,
        currentDomain: action.payload.domain,
        currentSubdomain: action.payload.subdomain,
        currentDescription: action.payload.description,
      }
    case 'PAUSE_TIMER':
      return {
        ...state,
        status: 'paused',
      }
    case 'RESUME_TIMER':
      return {
        ...state,
        status: 'running',
        pausedTime: state.pausedTime + action.payload.pauseDuration,
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
    case 'LOAD_STATE':
      return action.payload
    default:
      return state
  }
}

interface TimerContextType {
  state: TimerState
  startTimer: (
    taskId: string,
    taskName: string,
    domain: string,
    subdomain: string,
    description: string
  ) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => Promise<void>
  formatElapsedTime: (elapsed: number) => string
}

const TimerContext = createContext<TimerContextType | null>(null)

const STORAGE_KEY = 'timerState'

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
        dispatch({ type: 'LOAD_STATE', payload: parsedState })
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
        dispatch({ type: 'UPDATE_ELAPSED', payload: { elapsed } })
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
    dispatch({ type: 'START_TIMER', payload: { taskId, taskName, domain, subdomain, description } })
  }

  const pauseTimer = () => {
    if (state.status === 'running') {
      pauseStartRef.current = new Date()
      dispatch({ type: 'PAUSE_TIMER', payload: { pauseStartTime: new Date() } })
    }
  }

  const resumeTimer = () => {
    if (state.status === 'paused' && pauseStartRef.current) {
      const now = new Date()
      const pauseDuration = now.getTime() - pauseStartRef.current.getTime()
      dispatch({ type: 'RESUME_TIMER', payload: { pauseDuration } })
      pauseStartRef.current = null
    }
  }

  const stopTimer = async () => {
    if (state.status !== 'idle' && state.startTime && state.currentTaskId) {
      // Save the timer entry
      const entry: TimerEntry = {
        id: crypto.randomUUID(),
        userId: 'current-user', // Replace with actual user ID when auth is integrated
        taskId: state.currentTaskId,
        // Store a pure local date for the entry day
        date: DateTime.fromJSDate(state.startTime).toFormat('yyyy-LL-dd'),
        startTime: state.startTime.toISOString(),
        endTime: new Date().toISOString(),
        domain: state.currentDomain || '',
        subdomain: state.currentSubdomain || '',
        description: state.currentDescription || '',
      }

      try {
        await timerService.addEntry(entry)
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
        state,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        formatElapsedTime,
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
