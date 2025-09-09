import { Button } from '@/components/ui/button'
import { formatMonth, formatWeek } from '@/utils/calendar_utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeeklyCalendarHeaderProps {
  currentDate: Date
  onPreviousWeek: () => void
  onNextWeek: () => void
  onTodayClick: () => void
}

const WeeklyCalendarHeader = ({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onTodayClick,
}: WeeklyCalendarHeaderProps) => {
  return (
    <div className="w-full flex flex-col space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full" onClick={onTodayClick}>
            Aujourd'hui
          </Button>

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onPreviousWeek}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onNextWeek}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-medium text-gray-900">{formatMonth(currentDate)}</h2>
          <div className="text-sm text-gray-500">{formatWeek(currentDate)}</div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyCalendarHeader
