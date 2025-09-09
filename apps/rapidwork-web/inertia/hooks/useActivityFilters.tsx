import { useState, useEffect } from 'react'
import { format } from '@/utils/datetime'
import { TaskWithSessions } from '@/types/backend'

// Re-export pour compatibilité
export { type TaskWithSessions } from '@/types/backend'

export const useActivityFilters = (tasksWithSessions: TaskWithSessions[]) => {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [taskFilter, setTaskFilter] = useState<string>('')
  const [subdomainFilter, setSubdomainFilter] = useState<string>('all')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [filteredTasks, setFilteredTasks] = useState<TaskWithSessions[]>([])
  const [selectedTasksCount, setSelectedTasksCount] = useState(0)

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let filtered = [...tasksWithSessions]

    if (date) {
      const dateString = format(date, 'yyyy-MM-dd')
      filtered = filtered.filter((task) =>
        task.sessions.some((session) => session.date === dateString)
      )
    }

    if (taskFilter) {
      filtered = filtered.filter(
        (task) =>
          task.id.toLowerCase().includes(taskFilter.toLowerCase()) ||
          task.title.toLowerCase().includes(taskFilter.toLowerCase())
      )
    }

    if (domainFilter && domainFilter !== 'all') {
      filtered = filtered.filter((task) => task.domain?.name === domainFilter)
    }

    if (subdomainFilter && subdomainFilter !== 'all') {
      filtered = filtered.filter((task) => task.subdomain?.name === subdomainFilter)
    }

    setFilteredTasks(filtered)
  }, [tasksWithSessions, date, taskFilter, subdomainFilter, domainFilter])

  const handleResetFilters = () => {
    setDate(undefined)
    setTaskFilter('')
    setSubdomainFilter('all')
    setDomainFilter('all')
  }

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setFilteredTasks(
      filteredTasks.map((task) =>
        task.id === taskId ? { ...task, expanded: !task.expanded } : task
      )
    )
  }

  // Toggle task selection
  const toggleTaskSelection = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click from expanding

    const updatedTasks = filteredTasks.map((task) =>
      task.id === taskId ? { ...task, selected: !task.selected } : task
    )

    setFilteredTasks(updatedTasks)
    const selectedCount = updatedTasks.filter((task) => task.selected).length
    setSelectedTasksCount(selectedCount)
  }

  // Toggle all tasks selection
  const toggleAllTasksSelection = (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true

    const updatedTasks = filteredTasks.map((task) => ({
      ...task,
      selected: isChecked,
    }))

    setFilteredTasks(updatedTasks)
    setSelectedTasksCount(isChecked ? filteredTasks.length : 0)
  }

  // Clear all selections
  const clearAllSelections = () => {
    const updatedTasks = filteredTasks.map((task) => ({
      ...task,
      selected: false,
    }))

    setFilteredTasks(updatedTasks)
    setSelectedTasksCount(0)
  }

  return {
    date,
    setDate,
    taskFilter,
    setTaskFilter,
    subdomainFilter,
    setSubdomainFilter,
    domainFilter,
    setDomainFilter,
    filteredTasks,
    setFilteredTasks,
    selectedTasksCount,
    handleResetFilters,
    toggleTaskExpansion,
    toggleTaskSelection,
    toggleAllTasksSelection,
    clearAllSelections,
  }
}
