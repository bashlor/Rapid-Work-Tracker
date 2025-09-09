import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tuyau } from '../tuyau'
import { queryKeys } from '../lib/query_keys'

interface UseGetUserDataDashboardOptions {
  currentDate?: string
  enabled?: boolean
}

export function useGetUserDataDashboard(options: UseGetUserDataDashboardOptions = {}) {
  const { currentDate, enabled = true } = options

  return useQuery({
    queryKey: [queryKeys.dashboard.all[0], currentDate || 'current'],
    queryFn: async () => {
      const response = await tuyau.api.dashboard.$get({
        query: currentDate ? { currentDate } : undefined,
      })

      const responseData = response as any
      return responseData.data
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}

// Hook for week navigation
export function useWeekNavigation(initialDate?: Date) {
  const [currentWeek, setCurrentWeek] = useState(initialDate || new Date())

  const getWeekBoundaries = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    
    const weekStart = new Date(d.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    
    return { weekStart, weekEnd }
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  const isCurrentWeekValue = useMemo(() => {
    const now = new Date()
    const { weekStart, weekEnd } = getWeekBoundaries(currentWeek)
    return now >= weekStart && now <= weekEnd
  }, [currentWeek])

  return {
    currentWeek,
    weekBoundaries: getWeekBoundaries(currentWeek),
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isCurrentWeek: isCurrentWeekValue,
    setCurrentWeek,
  }
}
