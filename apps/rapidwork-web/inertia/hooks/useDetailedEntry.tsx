import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { BackendDomainWithSubdomains, BackendTaskWithRelations } from '@/types/backend'
import { format } from '@/utils/datetime'

interface TaskEntry {
  date: string
  description: string
  domain: string
  endTime: string
  id: string
  name: string
  startTime: string
  subdomain: string
}

export const useDetailedEntry = (date: Date, domains: BackendDomainWithSubdomains[], tasks: BackendTaskWithRelations[], user: any) => {
  const [currentTasks, setCurrentTasks] = useState<TaskEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [_, setSelectedSubdomain] = useState<string>('')
  const [taskIdInputOpen, setTaskIdInputOpen] = useState(false)
  const [matchingTask, setMatchingTask] = useState<BackendTaskWithRelations | null>(null)
  // TODO: Implémenter la gestion des entries dans un contexte séparé
  // const { addEntry, removeEntry, entries } = useEntries()

  const [formData, setFormData] = useState({
    description: '',
    domain: '',
    endTime: '',
    startTime: '',
    subdomain: '',
    taskId: '',
    taskName: '',
  })

  // Load timer entries for the selected date
  useEffect(() => {
    // TODO: Remplacer par la logique d'entries appropriée
    // if (!entries) return

    // Placeholder - remplacer par la vraie logique
    setCurrentTasks([])
    
    // const filteredEntries = entries
    //   .filter((entry) => entry.date === formattedDate)
    //   .map((entry) => ({
    //     id: entry.id,
    //     name: entry.taskName,
    //     startTime: entry.startTime,
    //     endTime: entry.endTime || '',
    //     domain: entry.domain,
    //     subdomain: entry.subdomain,
    //     description: entry.description || '',
    //     date: entry.date,
    //   }))

    // setCurrentTasks(filteredEntries)
  }, [date]) // Removed state.entries dependency

  const handleInputChange = (field: string, value: string) => {
    // Mise à jour du formData
    if (field === 'domain') {
      setSelectedDomain(value)
      setSelectedSubdomain('')
      setFormData((prevData) => ({
        ...prevData,
        domain: value,
        subdomain: '',
      }))
      return // Important: sortir de la fonction ici pour éviter les mises à jour en cascade
    }

    // Gérer la modification de l'ID de tâche séparément
    if (field === 'taskId') {
      const task = tasks.find((t) => t.id === value)

      // Mettre à jour l'état matchingTask sans déclencher d'autres mises à jour
      setMatchingTask(task || null)

      if (task) {
        // Si une tâche correspondante est trouvée, mettre à jour le formulaire
        const domainObj = domains.find((d) => d.name === task.domain?.name)

        setFormData((prevData) => ({
          ...prevData,
          description: task.description || '',
          domain: domainObj?.id || '',
          subdomain: domainObj?.subdomains.find((s) => s.name === task.subdomain?.name)?.id || '',
          taskId: task.id,
          taskName: task.title,
        }))

        // Mettre à jour les sélections de domaine et sous-domaine
        if (domainObj) {
          setSelectedDomain(domainObj.id)
        }
      } else {
        // Si aucune tâche correspondante n'est trouvée, mettre à jour uniquement l'ID de tâche
        setFormData((prevData) => ({
          ...prevData,
          taskId: value,
        }))
      }
      return // Important: sortir de la fonction pour éviter les mises à jour supplémentaires
    }

    // Pour tous les autres champs, simplement mettre à jour le formData
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }))
  }

  const handleSubmit = (isNewTask: boolean = false) => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter une tâche')
      return
    }

    if (
      !formData.taskName ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.domain ||
      !formData.subdomain
    ) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    // Si c'est une tâche existante, on vérifie qu'un ID de tâche est bien sélectionné
    if (!isNewTask && !formData.taskId) {
      toast.error('Veuillez sélectionner une tâche existante')
      return
    }

    const formattedDate = format(date, 'yyyy-MM-dd')

    // Find domain and subdomain names
    const domainObj = domains.find((d) => d.id === formData.domain)
    const subdomainObj = domainObj?.subdomains.find((s) => s.id === formData.subdomain)

    if (!domainObj || !subdomainObj) {
      toast.error('Domaine ou sous-domaine invalide')
      return
    }

    // Calculate duration in seconds
    const startParts = formData.startTime.split(':').map(Number)
    const endParts = formData.endTime.split(':').map(Number)
    const startMinutes = startParts[0] * 60 + startParts[1]
    const endMinutes = endParts[0] * 60 + endParts[1]
    const durationSeconds = Math.max(0, (endMinutes - startMinutes) * 60)

    // Create timer entry
    const timerEntry = {
      date: formattedDate,
      description: formData.description,
      domain: domainObj.name,
      duration: durationSeconds,
      endTime: formData.endTime,
      id: isNewTask ? crypto.randomUUID() : formData.taskId,
      startTime: formData.startTime,
      subdomain: subdomainObj.name,
      taskName: formData.taskName,
    }

    // TODO: Add entry to storage when entries context is implemented
    // addEntry(timerEntry)

    // Update local state
    const newTask = {
      date: timerEntry.date,
      description: timerEntry.description,
      domain: timerEntry.domain,
      endTime: timerEntry.endTime,
      id: timerEntry.id,
      name: timerEntry.taskName,
      startTime: timerEntry.startTime,
      subdomain: timerEntry.subdomain,
    }

    setCurrentTasks((prevTasks) => [...prevTasks, newTask])
    setIsModalOpen(false)
    resetForm()
    toast.success('Session ajoutée avec succès')
  }

  const resetForm = () => {
    setFormData({
      description: '',
      domain: '',
      endTime: '',
      startTime: '',
      subdomain: '',
      taskId: '',
      taskName: '',
    })
    setSelectedDomain('')
    setSelectedSubdomain('')
    setMatchingTask(null)
  }

    const handleRemoveEntry = (id: string) => {
    // TODO: Remove entry when entries context is implemented
    // removeEntry(id)
    
    // Update local state
    setCurrentTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
    toast.success('Entrée supprimée avec succès')
  }

  return {
    currentTasks,
    formData,
    handleInputChange,
    handleSubmit,
    isModalOpen,
    matchingTask,
    removeTask: handleRemoveEntry,
    resetForm,
    selectedDomain,
    setIsModalOpen,
    setTaskIdInputOpen,
    taskIdInputOpen,
  }
}
