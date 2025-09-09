import React from 'react'
import { Head } from '@inertiajs/react'
import TaskSelection from '../components/time-tracking/TaskSelection'
import type { TaskSelectionPageProps } from '../types/page_props'
import { useTimer } from '../contexts/TimerContext'

export default function TaskSelectionPage(props: TaskSelectionPageProps) {
  // Page currently does not use props directly
  const { state } = useTimer()
  const isRunning = state.status === 'running'
  const isPaused = state.status === 'paused'
  const isIdle = state.status === 'idle'

  return (
    <>
      <Head title="Sélection de Tâche" />
      <TaskSelection
        isRunning={isRunning}
        isPaused={isPaused}
        isIdle={isIdle}
      />
    </>
  )
}
