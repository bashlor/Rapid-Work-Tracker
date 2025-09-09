import { useQuery } from '@tanstack/react-query'
import { TimerEntry } from '@/lib/mock_data'
import { useMemo } from 'react'
import { DateTime } from 'luxon'

interface StatsResult {
  topTasks: Array<{ name: string; duration: number; description: string }>
  domainData: Array<{ name: string; duration: number }>
  subdomainData: Array<{ name: string; duration: number }>
  totalTime: number
  totalTasks: number
  // Nouvelles propriétés pour les KPI
  mostWorkedDomain: { name: string; duration: number } | null
  longestTask: { name: string; duration: number; description: string } | null
  // Données pour le graphique de tendance
  trendData: Array<{ date: string; time: number; formattedTime: string }>
  // Données détaillées des tâches
  taskDetails: Array<{
    id: string
    name: string
    domain: string
    subdomain: string
    duration: number
    description?: string
  }>
}

// Query Keys pour les stats
export const statsKeys = {
  all: ['stats'] as const,
  calculations: () => [...statsKeys.all, 'calculations'] as const,
  calculation: (entriesHash: string) => [...statsKeys.calculations(), entriesHash] as const,
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
      name,
      duration,
      description: taskDescriptions.get(name) || 'Aucune description',
    }))

  const domainData = Array.from(domainStats.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, duration]) => ({ name, duration }))

  const subdomainData = Array.from(subdomainStats.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, duration]) => ({ name, duration }))

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
        time,
        formattedTime: formatTime(time),
      }
    })

  // Task details
  const taskDetails = Array.from(taskStats.entries()).map(([taskId, duration]) => ({
    id: taskId,
    name: taskId, // En attendant d'avoir le nom réel
    domain: taskDomains.get(taskId) || '',
    subdomain: taskSubdomains.get(taskId) || '',
    duration,
    description: taskDescriptions.get(taskId),
  }))

  return {
    topTasks,
    domainData,
    subdomainData,
    totalTime,
    totalTasks,
    mostWorkedDomain,
    longestTask,
    trendData,
    taskDetails,
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
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: statsKeys.calculation(entriesHash),
    queryFn: () => calculateStats(entries),
    initialData: initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes - les stats peuvent être cachées un peu
    enabled: entries.length > 0, // Ne calcule que si on a des entries
  })

  return {
    stats: stats || {
      topTasks: [],
      domainData: [],
      subdomainData: [],
      totalTime: 0,
      totalTasks: 0,
      mostWorkedDomain: null,
      longestTask: null,
      trendData: [],
      taskDetails: [],
    },
    loading,
    error,
    refetch,
  }
}
