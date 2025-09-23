import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { DayPicker } from 'react-day-picker'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn('p-4', className)}
      classNames={{
        caption_label: 'text-base font-semibold text-gray-900',
        cell: cn(
          'flex justify-center',
          'relative p-0 text-center text-sm',
          'h-10 w-10 m-0.5',
          'focus-within:relative focus-within:z-20'
        ),
        day: cn(
          'h-10 w-10 font-normal rounded-md',
          'h-10 w-10 font-normal rounded-md',
          'hover:bg-gray-100 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'aria-selected:opacity-100',
        ),
        day_disabled: 'text-gray-300 opacity-50 cursor-not-allowed',
        day_hidden: 'invisible',
        day_outside: cn(
          'day-outside text-gray-400 opacity-50',
          'aria-selected:bg-blue-100 aria-selected:text-blue-600 aria-selected:opacity-70'
        ),
        day_range_end: 'day-range-end',
        day_range_middle: 'aria-selected:bg-blue-100 aria-selected:text-blue-700',
        day_selected: cn(
          'bg-blue-600 text-white font-semibold',
          'hover:bg-blue-700 hover:text-white',
          'focus:bg-blue-700 focus:text-white'
        ),
        day_today: 'bg-blue-50 text-blue-700 font-semibold border border-blue-200',
        head_cell:
          'text-gray-500 rounded-md w-10 h-10 font-medium text-sm flex items-center justify-center',
        head_row: 'flex mb-2',
        month: 'space-y-4',
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-white border-gray-200 p-0 hover:bg-gray-50 hover:border-gray-300 transition-colors'
        ),
        row: 'flex w-full',
        table: 'w-full border-collapse space-y-1',
        ...classNames,
      }}
      showOutsideDays={showOutsideDays}

      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
