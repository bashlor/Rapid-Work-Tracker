import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatMonth, formatWeek } from '@/utils/calendar_utils'

interface WeeklyCalendarHeaderProps {
  currentDate: Date
  onNextWeek: () => void
  onPreviousWeek: () => void
  onTodayClick: () => void
}

const WeeklyCalendarHeader = ({
  currentDate,
  onNextWeek,
  onPreviousWeek,
  onTodayClick,
}: WeeklyCalendarHeaderProps) => {
  return (
    <div className="w-full flex flex-col space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button className="rounded-full" onClick={onTodayClick} variant="outline">
            Aujourd'hui
          </Button>

          <div className="flex items-center space-x-1">
            <Button className="rounded-full" onClick={onPreviousWeek} size="icon" variant="ghost">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button className="rounded-full" onClick={onNextWeek} size="icon" variant="ghost">
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
