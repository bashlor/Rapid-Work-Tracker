import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTimer } from '@/contexts/TimerContext'
import { Play, Pause, Square, Clock, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useDomainsManagement } from '@/hooks/useDomainsManagement'
import { useTasksManagement } from '@/hooks/useTasksManagement'
import { useSessionsManagement } from '@/hooks/useSessionsManagement'
import type { BackendTaskWithRelations } from '@/types/backend'

interface TaskSelectionProps {
  onTaskStart?: (task: {
    id: string
    name: string
    domain: string
    subdomain: string
    description: string
  }) => void
  showTimerControls?: boolean
  isRunning: boolean
  isPaused: boolean
  isIdle: boolean
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

  const { state, startTimer, pauseTimer, resumeTimer, stopTimer, formatElapsedTime } = useTimer()
  
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
          title: newTaskTitle,
          description: taskDescription,
          domainId: selectedDomain,
          subDomainId: selectedSubdomain || null,
          status: 'in_progress',
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
      currentTaskId: taskId,
      currentTaskName: taskName,
      currentDomain: selectedDomainObj.name,
      currentSubdomain: subdomainName,
      currentDescription: taskDescription,
    }
    localStorage.setItem('currentTimerState', JSON.stringify(timerState))

    // Call optional callback
    if (onTaskStart) {
      onTaskStart({
        id: taskId,
        name: taskName,
        domain: selectedDomainObj.name,
        subdomain: subdomainName,
        description: taskDescription,
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
          taskId: state.currentTaskId,
          startTime: state.startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: duration,
          description: state.currentDescription || '',
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
              value={selectedDomain}
              onValueChange={(value) => {
                setSelectedDomain(value)
                setSelectedSubdomain('')
                setSelectedTask('')
              }}
              disabled={state.status !== 'idle'}
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
                value={selectedSubdomain}
                onValueChange={(value) => {
                  setSelectedSubdomain(value)
                  setSelectedTask('')
                }}
                disabled={state.status !== 'idle'}
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
                    value={selectedTask} 
                    onValueChange={setSelectedTask}
                    disabled={state.status !== 'idle'}
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
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreatingNewTask(true)}
                    disabled={state.status !== 'idle'}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une nouvelle tâche
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    id="newTaskTitle"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Titre de la nouvelle tâche..."
                    disabled={state.status !== 'idle'}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingNewTask(false)
                      setNewTaskTitle('')
                    }}
                    disabled={state.status !== 'idle'}
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
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Description de ce que vous allez faire..."
                disabled={state.status !== 'idle'}
              />
            </div>
          )}

          {/* Start Timer Button */}
          {selectedDomain && (selectedTask || (isCreatingNewTask && newTaskTitle)) && state.status === 'idle' && (
            <Button onClick={handleStartTimer} className="w-full">
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
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
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
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (state.status === 'idle') {
                          setSelectedTask(task.id)
                          setSelectedDomain(task.domainId || '')
                          setSelectedSubdomain(task.subDomainId || '')
                          handleStartTimer()
                        }
                      }}
                      disabled={state.status !== 'idle'}
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
