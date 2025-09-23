import TaskSelection from '@/components/time-tracking/TaskComponents/TaskSelection'
import { useTimer } from '@/contexts/TimerContext'

export function TaskSelectionView() {
  const { state } = useTimer()
  const isRunning = state.status === 'running'
  const isPaused = state.status === 'paused'
  const isIdle = state.status === 'idle'

  return <TaskSelection isIdle={isIdle} isPaused={isPaused} isRunning={isRunning} />
}
