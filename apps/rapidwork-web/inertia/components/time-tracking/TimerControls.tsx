import { Play, Pause, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimer } from '@/contexts/TimerContext'

interface TimerControlsProps {
  isRunning: boolean
  isPaused: boolean
  onStart: () => void
}

const TimerControls = ({ isRunning, isPaused, onStart }: TimerControlsProps) => {
  const { pauseTimer, resumeTimer, stopTimer, formatElapsedTime, state } = useTimer()

  const getTaskButtonState = () => {
    if (isRunning) {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={pauseTimer}>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
          <Button variant="outline" onClick={stopTimer}>
            <StopCircle className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </div>
      )
    }
    if (isPaused) {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={resumeTimer}>
            <Play className="mr-2 h-4 w-4" />
            Reprendre
          </Button>
          <Button variant="outline" onClick={stopTimer}>
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
