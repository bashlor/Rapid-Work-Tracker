import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useMemo } from 'react'

import { TimerEntry } from '@/lib/mock_data'

interface StatsResult {
  domainData: Array<{ duration: number; name: string }>
  longestTask: null | { description: string; duration: number; name: string }
  // Nouvelles propriétés pour les KPI
  mostWorkedDomain: null | { duration: number; name: string }
  subdomainData: Array<{ duration: number; name: string }>
  // Données détaillées des tâches
  taskDetails: Array<{
    description?: string
    domain: string
    duration: number
    id: string
    name: string
    subdomain: string
  }>
  topTasks: Array<{ description: string; duration: number; name: string }>
  totalTasks: number
  totalTime: number
  // Données pour le graphique de tendance
  trendData: Array<{ date: string; formattedTime: string; time: number }>
}

// Query Keys pour les stats
export const statsKeys = {
  all: ['stats'] as const,
  calculation: (entriesHash: string) => [...statsKeys.calculations(), entriesHash] as const,
  calculations: () => [...statsKeys.all, 'calculations'] as const,
}

// Fonction pour calculer les stats
const calculateStats = (entries: TimerEntry[]): StatsResult => {
  const taskStats = new Map<string, number>()
  const domainStats = new Map<string, number>()
  const subdomainStats = new Map<string, number>()
  const taskDescriptions = new Map<string, string>() // Map to store task descriptions
  const taskDomains = new Map<string, string>() // Map to store task domains
  const taskSubdomains = new Map<string, string>() // Map to store task subdomains
  const dailyStats = new Map<string, number>() // Map for trend data
  let totalTime = 0
  const totalTasks = entries.length

  entries.forEach((entry) => {
    // Calculate duration from startTime and endTime
    const startTime = new Date(entry.startTime)
    const endTime = new Date(entry.endTime)
    const duration = endTime.getTime() - startTime.getTime()

    // Task stats (using taskId as the key)
    const taskKey = entry.taskId
    taskStats.set(taskKey, (taskStats.get(taskKey) || 0) + duration)

    // Store task metadata if available
    if (entry.description && !taskDescriptions.has(taskKey)) {
      taskDescriptions.set(taskKey, entry.description)
    }
    if (!taskDomains.has(taskKey)) {
      taskDomains.set(taskKey, entry.domain)
    }
    if (!taskSubdomains.has(taskKey)) {
      taskSubdomains.set(taskKey, entry.subdomain)
    }

    // Domain stats
    const domainKey = entry.domain
    domainStats.set(domainKey, (domainStats.get(domainKey) || 0) + duration)

    // Subdomain stats
    const subdomainKey = `${entry.domain} - ${entry.subdomain}`
    subdomainStats.set(subdomainKey, (subdomainStats.get(subdomainKey) || 0) + duration)

    // Daily stats for trend
    const dateKey = entry.date
    dailyStats.set(dateKey, (dailyStats.get(dateKey) || 0) + duration)

    totalTime += duration
  })

  // Sort and format results
  const topTasks = Array.from(taskStats.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, duration]) => ({
      description: taskDescriptions.get(name) || 'Aucune description',
      duration,
      name,
    }))

  const domainData = Array.from(domainStats.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, duration]) => ({ duration, name }))

  const subdomainData = Array.from(subdomainStats.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, duration]) => ({ duration, name }))

  // KPI calculations
  const mostWorkedDomain = domainData.length > 0 ? domainData[0] : null
  const longestTask = topTasks.length > 0 ? topTasks[0] : null

  // Trend data
  const trendData = Array.from(dailyStats.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, time]) => {
      // 'date' is a pure yyyy-MM-dd; parse as local day to avoid UTC shifting
      const dt = DateTime.fromFormat(date, 'yyyy-LL-dd').setLocale('fr')
      const label = dt.isValid ? dt.toFormat('dd LLL') : date
      return {
        date: label,
        formattedTime: formatTime(time),
        time,
      }
    })

  // Task details
  const taskDetails = Array.from(taskStats.entries()).map(([taskId, duration]) => ({
    description: taskDescriptions.get(taskId),
    domain: taskDomains.get(taskId) || '',
    duration,
    id: taskId,
    name: taskId, // En attendant d'avoir le nom réel
    subdomain: taskSubdomains.get(taskId) || '',
  }))

  return {
    domainData,
    longestTask,
    mostWorkedDomain,
    subdomainData,
    taskDetails,
    topTasks,
    totalTasks,
    totalTime,
    trendData,
  }
}

// Helper function to format time
const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
  }
  return `${minutes}m`
}

// Hook principal avec useMemo pour les calculs locaux (rapides)
export const useStatsCalculation = (entries: TimerEntry[]): StatsResult => {
  return useMemo(() => calculateStats(entries), [entries])
}

// Hook avec React Query pour les calculs lourds (avec cache)
export const useStatsCalculationWithQuery = (entries: TimerEntry[], initialData?: StatsResult) => {
  // Créer un hash des entries pour le cache
  const entriesHash = useMemo(() => {
    return entries
      .map((e) => `${e.id}-${e.startTime}-${e.endTime}`)
      .sort()
      .join('|')
  }, [entries])

  const {
    data: stats,
    error,
    isLoading: loading,
    refetch,
  } = useQuery({
    enabled: entries.length > 0, // Ne calcule que si on a des entries
    initialData: initialData,
    queryFn: () => calculateStats(entries),
    queryKey: [...statsKeys.calculation(entriesHash), entries],
    staleTime: 5 * 60 * 1000, // 5 minutes - les stats peuvent être cachées un peu
  })

  return {
    error,
    loading,
    refetch,
    stats: stats || {
      domainData: [],
      longestTask: null,
      mostWorkedDomain: null,
      subdomainData: [],
      taskDetails: [],
      topTasks: [],
      totalTasks: 0,
      totalTime: 0,
      trendData: [],
    },
  }
}
