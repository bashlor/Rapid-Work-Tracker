import { Pause, Play, StopCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTimer } from '@/contexts/TimerContext'

interface TimerControlsProps {
  isPaused: boolean
  isRunning: boolean
  onStart: () => void
}

const TimerControls = ({ isPaused, isRunning, onStart }: TimerControlsProps) => {
  const { formatElapsedTime, pauseTimer, resumeTimer, state, stopTimer } = useTimer()

  const getTaskButtonState = () => {
    if (isRunning) {
      return (
        <div className="flex gap-2">
          <Button onClick={pauseTimer} variant="outline">
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
          <Button onClick={stopTimer} variant="outline">
            <StopCircle className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </div>
      )
    }
    if (isPaused) {
      return (
        <div className="flex gap-2">
          <Button onClick={resumeTimer} variant="outline">
            <Play className="mr-2 h-4 w-4" />
            Reprendre
          </Button>
          <Button onClick={stopTimer} variant="outline">
            <StopCircle className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </div>
      )
    }
    return (
      <Button onClick={onStart}>
        <Play className="mr-2 h-4 w-4" />
        Démarrer
      </Button>
    )
  }

  return (
    <div className="flex justify-between items-center pt-4">
      {getTaskButtonState()}

      {(isRunning || isPaused) && (
        <div className="text-2xl font-mono">{formatElapsedTime(state.elapsed)}</div>
      )}
    </div>
  )
}

export default TimerControls
