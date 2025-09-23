import { useCallback, useEffect, useRef, useState } from 'react'

export interface TimerHookReturn {
  formatElapsedTime: (elapsed: number) => string
  pauseTimer: () => void
  reset: () => void
  resumeTimer: () => void
  startTimer: (
    taskId: string,
    taskName: string,
    domain: string,
    subdomain: string,
    description?: string
  ) => void
  state: TimerState
  stopTimer: () => void
}

export interface TimerState {
  currentDescription: null | string
  currentDomain: null | string
  currentSubdomain: null | string
  currentTaskId: null | string
  currentTaskName: null | string
  elapsed: number // Temps écoulé réel (en millisecondes)
  pausedTime: number // Temps total en pause (en millisecondes)
  startTime: Date | null
  status: TimerStatus
}

export type TimerStatus = 'idle' | 'paused' | 'running'

const STORAGE_KEY = 'timerState'

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

export function useTimer(): TimerHookReturn {
  const [state, setState] = useState<TimerState>(initialState)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pauseStartRef = useRef<Date | null>(null)

  // Fonction pour calculer le temps écoulé précis
  const calculateElapsed = useCallback((startTime: Date, pausedTime: number): number => {
    if (!startTime) return 0
    const now = new Date()
    const totalTime = now.getTime() - startTime.getTime()
    return Math.max(0, totalTime - pausedTime)
  }, [])

  // Fonction pour formater le temps
  const formatElapsedTime = useCallback((elapsed: number): string => {
    const totalSeconds = Math.floor(elapsed / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Sauvegarde dans localStorage
  const saveToStorage = useCallback((newState: TimerState) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...newState,
          startTime: newState.startTime?.toISOString() || null,
        })
      )
    } catch (error) {
      console.error('Failed to save timer state:', error)
    }
  }, [])

  // Chargement depuis localStorage
  const loadFromStorage = useCallback((): null | TimerState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return null

      const parsed = JSON.parse(saved)
      return {
        ...parsed,
        startTime: parsed.startTime ? new Date(parsed.startTime) : null,
      }
    } catch (error) {
      console.error('Failed to load timer state:', error)
      return null
    }
  }, [])

  // Chargement initial
  useEffect(() => {
    const savedState = loadFromStorage()
    if (savedState) {
      setState(savedState)
    }
  }, [loadFromStorage])

  // Gestion de l'interval pour le timer
  useEffect(() => {
    if (state.status === 'running' && state.startTime) {
      intervalRef.current = setInterval(() => {
        setState((prevState) => {
          if (prevState.status === 'running' && prevState.startTime) {
            const newElapsed = calculateElapsed(prevState.startTime, prevState.pausedTime)
            const newState = { ...prevState, elapsed: newElapsed }
            saveToStorage(newState)
            return newState
          }
          return prevState
        })
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
  }, [state.status, state.startTime, calculateElapsed, saveToStorage])

  // Démarrer le timer
  const startTimer = useCallback(
    (
      taskId: string,
      taskName: string,
      domain: string,
      subdomain: string,
      description: string = ''
    ) => {
      const now = new Date()
      const newState: TimerState = {
        currentDescription: description,
        currentDomain: domain,
        currentSubdomain: subdomain,
        currentTaskId: taskId,
        currentTaskName: taskName,
        elapsed: 0,
        pausedTime: 0,
        startTime: now,
        status: 'running',
      }
      setState(newState)
      saveToStorage(newState)
    },
    [saveToStorage]
  )

  // Mettre en pause
  const pauseTimer = useCallback(() => {
    if (state.status === 'running') {
      pauseStartRef.current = new Date()
      const newState = { ...state, status: 'paused' as TimerStatus }
      setState(newState)
      saveToStorage(newState)
    }
  }, [state, saveToStorage])

  // Reprendre
  const resumeTimer = useCallback(() => {
    if (state.status === 'paused' && pauseStartRef.current) {
      const now = new Date()
      const pauseDuration = now.getTime() - pauseStartRef.current.getTime()
      const newState = {
        ...state,
        pausedTime: state.pausedTime + pauseDuration,
        status: 'running' as TimerStatus,
      }
      setState(newState)
      saveToStorage(newState)
      pauseStartRef.current = null
    }
  }, [state, saveToStorage])

  // Arrêter le timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Calculer le temps final si le timer était actif
    let finalElapsed = state.elapsed
    if (state.status === 'running' && state.startTime) {
      finalElapsed = calculateElapsed(state.startTime, state.pausedTime)
    } else if (state.status === 'paused' && pauseStartRef.current) {
      // Si on était en pause, ajouter le temps de pause actuel
      const now = new Date()
      const currentPauseDuration = now.getTime() - pauseStartRef.current.getTime()
      if (state.startTime) {
        finalElapsed = calculateElapsed(state.startTime, state.pausedTime + currentPauseDuration)
      }
    }

    const newState = { ...initialState }
    setState(newState)
    saveToStorage(newState)
    pauseStartRef.current = null
  }, [state, calculateElapsed, formatElapsedTime, saveToStorage])

  // Reset complet
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const newState = { ...initialState }
    setState(newState)
    saveToStorage(newState)
    pauseStartRef.current = null
  }, [saveToStorage])

  return {
    formatElapsedTime,
    pauseTimer,
    reset,
    resumeTimer,
    startTimer,
    state,
    stopTimer,
  }
}
