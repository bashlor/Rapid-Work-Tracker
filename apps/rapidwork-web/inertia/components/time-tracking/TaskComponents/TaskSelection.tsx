import { Clock, Pause, Play, Plus, Square } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { BackendTaskWithRelations } from '@/types/backend'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTimer } from '@/contexts/TimerContext'
import { useDomainsManagement } from '@/hooks/useDomainsManagement'
import { useSessionsManagement } from '@/hooks/useSessionsManagement'
import { useTasksManagement } from '@/hooks/useTasksManagement'

interface TaskSelectionProps {
  isIdle: boolean
  isPaused: boolean
  isRunning: boolean
  onTaskStart?: (task: {
    description: string
    domain: string
    id: string
    name: string
    subdomain: string
  }) => void
  showTimerControls?: boolean
}

const TaskSelection: React.FC<TaskSelectionProps> = ({
  onTaskStart,
  showTimerControls = true,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [taskDescription, setTaskDescription] = useState<string>('')
  const [newTaskTitle, setNewTaskTitle] = useState<string>('')
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false)

  const { formatElapsedTime, pauseTimer, resumeTimer, startTimer, state, stopTimer } = useTimer()
  
  // Utiliser les hooks API
  const { domains, loading: domainsLoading } = useDomainsManagement()
  const tasksData = useTasksManagement()
  const tasks: BackendTaskWithRelations[] = Array.isArray(tasksData.tasks) ? tasksData.tasks : []
  const tasksLoading = tasksData.loading
  const addTask = tasksData.addTask
  const { createSession } = useSessionsManagement(new Date())

  // Restaurer l'état du timer depuis le localStorage au montage
  useEffect(() => {
    const savedTimerState = localStorage.getItem('timerState')
    if (savedTimerState && tasks.length > 0) {
      try {
        const parsedState = JSON.parse(savedTimerState)
        // Le TimerContext gère déjà la restauration, on peut juste mettre à jour les sélections
        if (parsedState.currentTaskId) {
          const task = tasks.find((t) => t.id === parsedState.currentTaskId)
          if (task) {
            setSelectedTask(task.id)
            setSelectedDomain(task.domainId || '')
            setSelectedSubdomain(task.subDomainId || '')
            setTaskDescription(parsedState.currentDescription || '')
          }
        }
      } catch (error) {
        console.error('Erreur lors de la restauration du timer:', error)
      }
    }
  }, [tasks])

  // Get selected domain object
  const selectedDomainObj = domains.find((d) => d.id === selectedDomain)

  // Get available subdomains for selected domain
  const availableSubdomains = selectedDomainObj?.subdomains || []

  // Filtrer les tâches en fonction du domaine et sous-domaine sélectionnés
  const availableTasks: BackendTaskWithRelations[] = tasks.filter((task) => {
    if (!selectedDomain) return false
    
    // Filtrer par domaine
    if (task.domainId !== selectedDomain) return false
    
    // Vérifier si le domaine a des sous-domaines
    const domainHasSubdomains = availableSubdomains.length > 0
    
    // Si le domaine a des sous-domaines et qu'un sous-domaine est sélectionné, filtrer par sous-domaine
    if (domainHasSubdomains && selectedSubdomain) {
      return task.subDomainId === selectedSubdomain
    }
    
    // Si le domaine a des sous-domaines mais qu'aucun n'est sélectionné, montrer toutes les tâches du domaine
    if (domainHasSubdomains && !selectedSubdomain) {
      // Ne montrer que les tâches en cours (pas terminées)
      return task.status !== 'completed' && task.status !== 'cancelled'
    }
    
    // Si le domaine n'a pas de sous-domaines, inclure toutes les tâches du domaine
    // Ne montrer que les tâches en cours (pas terminées)
    return task.status !== 'completed' && task.status !== 'cancelled'
  })

  const handleStartTimer = async () => {
    if (!selectedDomainObj) {
      toast.error('Veuillez sélectionner un domaine')
      return
    }

    const subdomain = availableSubdomains.find((sd) => sd.id === selectedSubdomain)
    const subdomainName = subdomain?.name || ''

    let taskId = selectedTask
    let taskName = ''

    // Si on crée une nouvelle tâche
    if (isCreatingNewTask && newTaskTitle) {
      try {
        const success = await addTask({
          description: taskDescription,
          domainId: selectedDomain,
          status: 'in_progress',
          subDomainId: selectedSubdomain || null,
          title: newTaskTitle,
        })
        
        if (success) {
          // Récupérer la tâche nouvellement créée
          const newTask = tasks.find((t) => t.title === newTaskTitle)
          if (newTask) {
            taskId = newTask.id
            taskName = newTask.title
          }
        } else {
          toast.error('Erreur lors de la création de la tâche')
          return
        }
      } catch (error) {
        console.error('Erreur lors de la création de la tâche:', error)
        toast.error('Erreur lors de la création de la tâche')
        return
      }
    } else {
      // Utiliser une tâche existante
      const task = availableTasks.find((t) => t.id === selectedTask)
      if (!task && !isCreatingNewTask) {
        toast.error('Veuillez sélectionner ou créer une tâche')
        return
      }
      taskName = task?.title || 'Nouvelle tâche'
      taskId = task?.id || ''
    }

    // Démarrer le timer
    startTimer(taskId, taskName, selectedDomainObj.name, subdomainName, taskDescription)

    // Sauvegarder l'état dans le localStorage
    const timerState = {
      currentDescription: taskDescription,
      currentDomain: selectedDomainObj.name,
      currentSubdomain: subdomainName,
      currentTaskId: taskId,
      currentTaskName: taskName,
    }
    localStorage.setItem('currentTimerState', JSON.stringify(timerState))

    // Call optional callback
    if (onTaskStart) {
      onTaskStart({
        description: taskDescription,
        domain: selectedDomainObj.name,
        id: taskId,
        name: taskName,
        subdomain: subdomainName,
      })
    }

    toast.success(`Chronomètre démarré pour: ${taskName}`)
  }

  const handleStopTimer = async () => {
    // Créer la session avant d'arrêter le timer
    if (state.currentTaskId && state.startTime) {
      try {
        const endTime = new Date()
        const duration = Math.floor((endTime.getTime() - state.startTime.getTime()) / 1000) // en secondes
        
        await createSession({
          description: state.currentDescription || '',
          duration: duration,
          endTime: endTime.toISOString(),
          startTime: state.startTime.toISOString(),
          taskId: state.currentTaskId,
        })
        
        toast.success('Session enregistrée avec succès')
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la session:', error)
        toast.error('Erreur lors de l\'enregistrement de la session')
      }
    }
    
    await stopTimer()
    
    // Nettoyer le localStorage
    localStorage.removeItem('currentTimerState')
    
    toast.success('Chronomètre arrêté')
  }

  const loading = domainsLoading || tasksLoading

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Current Timer Status */}
      {state.status !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Chronomètre en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Tâche:</strong> {state.currentTaskName}
              </p>
              <p>
                <strong>Domaine:</strong> {state.currentDomain}
              </p>
              {state.currentSubdomain && (
                <p>
                  <strong>Sous-domaine:</strong> {state.currentSubdomain}
                </p>
              )}
              {state.currentDescription && (
                <p>
                  <strong>Description:</strong> {state.currentDescription}
                </p>
              )}
              <p className="text-2xl font-bold text-blue-600">
                {formatElapsedTime(state.elapsed)}
              </p>
            </div>

            {showTimerControls && (
              <div className="flex gap-2 mt-4">
                {state.status === 'running' && (
                  <Button onClick={pauseTimer} variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}

                {state.status === 'paused' && (
                  <Button onClick={resumeTimer} variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Reprendre
                  </Button>
                )}

                <Button onClick={handleStopTimer} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Arrêter et enregistrer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Task Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Sélection de tâche</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Domain Selection */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domaine *</Label>
            <Select
              disabled={state.status !== 'idle'}
              onValueChange={(value) => {
                setSelectedDomain(value)
                setSelectedSubdomain('')
                setSelectedTask('')
              }}
              value={selectedDomain}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un domaine" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subdomain Selection */}
          {selectedDomain && availableSubdomains.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subdomain">Sous-domaine (optionnel)</Label>
              <Select
                disabled={state.status !== 'idle'}
                onValueChange={(value) => {
                  setSelectedSubdomain(value)
                  setSelectedTask('')
                }}
                value={selectedSubdomain}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un sous-domaine (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun sous-domaine</SelectItem>
                  {availableSubdomains.map((subdomain) => (
                    <SelectItem key={subdomain.id} value={subdomain.id}>
                      {subdomain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Task Selection or Creation */}
          {selectedDomain && (
            <div className="space-y-2">
              <Label htmlFor="task">Tâche</Label>
              
              {!isCreatingNewTask ? (
                <>
                  <Select 
                    disabled={state.status !== 'idle'} 
                    onValueChange={setSelectedTask}
                    value={selectedTask}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une tâche existante" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasks.length > 0 ? (
                        availableTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                            {task.description && (
                              <span className="text-gray-500 ml-2 text-sm">
                                - {task.description}
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          Aucune tâche active pour ce domaine
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    className="w-full"
                    disabled={state.status !== 'idle'}
                    onClick={() => setIsCreatingNewTask(true)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une nouvelle tâche
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    disabled={state.status !== 'idle'}
                    id="newTaskTitle"
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Titre de la nouvelle tâche..."
                    value={newTaskTitle}
                  />
                  
                  <Button
                    disabled={state.status !== 'idle'}
                    onClick={() => {
                      setIsCreatingNewTask(false)
                      setNewTaskTitle('')
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Annuler la création
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Task Description */}
          {(selectedTask || isCreatingNewTask) && selectedDomain && (
            <div className="space-y-2">
              <Label htmlFor="description">Description de la session</Label>
              <Input
                disabled={state.status !== 'idle'}
                id="description"
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Description de ce que vous allez faire..."
                value={taskDescription}
              />
            </div>
          )}

          {/* Start Timer Button */}
          {selectedDomain && (selectedTask || (isCreatingNewTask && newTaskTitle)) && state.status === 'idle' && (
            <Button className="w-full" onClick={handleStartTimer}>
              <Play className="h-4 w-4 mr-2" />
              Démarrer le chronomètre
            </Button>
          )}

          {state.status !== 'idle' && (
            <p className="text-sm text-muted-foreground text-center">
              Un chronomètre est déjà en cours. Arrêtez-le pour en démarrer un nouveau.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tâches récentes/actives */}
      {tasks.filter((t) => t.status === 'in_progress').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tâches en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.status === 'in_progress')
                .slice(0, 5)
                .map((task) => (
                  <div
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    key={task.id}
                    onClick={() => {
                      if (state.status === 'idle') {
                        setSelectedTask(task.id)
                        setSelectedDomain(task.domainId || '')
                        setSelectedSubdomain(task.subDomainId || '')
                      }
                    }}
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-gray-600">{task.description}</p>
                      )}
                    </div>
                    <Button
                      disabled={state.status !== 'idle'}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (state.status === 'idle') {
                          setSelectedTask(task.id)
                          setSelectedDomain(task.domainId || '')
                          setSelectedSubdomain(task.subDomainId || '')
                          handleStartTimer()
                        }
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TaskSelection
