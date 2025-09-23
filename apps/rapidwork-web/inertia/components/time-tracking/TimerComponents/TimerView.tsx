import { Clock, Pause, Play, Square } from 'lucide-react'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { useNotification } from '@/hooks/useNotification'
import { SessionFormData } from '@/hooks/useSessionsManagement'
import { BackendDomainWithSubdomains, BackendTaskWithRelations, BackendWorkSession } from '@/types'

interface TimerViewProps {
  createSession: (sessionData: SessionFormData) => Promise<BackendWorkSession>
  domains: BackendDomainWithSubdomains[]
  tasks: BackendTaskWithRelations[]
}

const TimerView = ({ createSession, domains, tasks }: TimerViewProps) => {
  const { formatElapsedTime, pauseTimer, resumeTimer, startTimer, state, stopTimer } = useTimer()
  const { error, showTimerNotification } = useNotification()

  const loading = false

  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>('')
  const [taskName, setTaskName] = useState<string>('')
  const [taskDescription, setTaskDescription] = useState<string>('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [confirmDialogData, setConfirmDialogData] = useState<null | { 
    durationText: string; 
    onCancel: () => void; 
    onConfirm: () => void; 
    taskName: string; 
  }>(null)

  const isRunning = state.status === 'running'
  const isPaused = state.status === 'paused'
  const isIdle = state.status === 'idle'

  // Get selected domain object
  const selectedDomainObj = domains.find((d) => d.id === selectedDomain)
  const availableSubdomains = selectedDomainObj?.subdomains || []
  
  // Check if the selected domain has subdomains
  const domainHasSubdomains = availableSubdomains.length > 0
  
  // Get selected subdomain object
  const selectedSubdomainObj = availableSubdomains.find((sd: { id: string; name: string }) => sd.id === selectedSubdomain)
  
  // Filter tasks based on selected domain and subdomain
  const availableTasks = tasks.filter((task) => {
    if (!selectedDomainObj) return false
    if (task.domain?.name !== selectedDomainObj.name) return false
    
    // Si le domaine a des sous-domaines et qu'un sous-domaine est sélectionné, filtrer par sous-domaine
    if (domainHasSubdomains && selectedSubdomain) {
      return task.subdomain?.name === selectedSubdomainObj?.name
    }
    
    // Si le domaine a des sous-domaines mais qu'aucun n'est sélectionné,
    // inclure TOUTES les tâches du domaine pour permettre la sélection
    if (domainHasSubdomains && !selectedSubdomain) {
      return true // Changement ici : on montre toutes les tâches
    }
    
    // Si le domaine n'a pas de sous-domaines, inclure toutes les tâches du domaine
    return true
  })

  // Get recent tasks (last 5)
  const recentTasks = tasks.slice(0, 5)

  const handleStartTimer = () => {
    if (!selectedDomainObj) {
      error('Veuillez sélectionner un domaine')
      return
    }

    // Plus de validation du sous-domaine - l'utilisateur peut choisir une tâche librement

    if (!taskName.trim()) {
      error('Veuillez saisir le nom de la tâche')
      return
    }

    // Trouver la tâche sélectionnée pour utiliser son vrai ID
    const selectedTask = availableTasks.find(t => t.title === taskName)
    if (!selectedTask) {
      error('Tâche introuvable. Veuillez sélectionner une tâche existante.')
      return
    }

    const subdomainName = selectedSubdomainObj?.name || ''
    startTimer(selectedTask.id, taskName, selectedDomainObj.name, subdomainName, taskDescription)

    // Reset form
    setTaskName('')
    setTaskDescription('')
    setShowTaskForm(false)

    showTimerNotification('start', taskName)
  }

  const handleStopTimer = async () => {
    const currentTaskName = state.currentTaskName
    
    // Créer la session via l'API avant d'arrêter le timer
    if (state.startTime && state.currentTaskId) {
      const endTime = new Date()
      const startTime = state.startTime
      const durationMs = endTime.getTime() - startTime.getTime()
      const durationMinutes = durationMs / (1000 * 60)
      
      const sessionData: SessionFormData = {
        description: state.currentDescription || '',
        duration: Math.round(durationMs / 1000), // Convert to seconds
        endTime: endTime.toISOString(),
        startTime: startTime.toISOString(),
        taskId: state.currentTaskId,
      }
      
      // Vérifier si la session dure moins de 5 minutes
      if (durationMinutes < 5) {
        const durationText = durationMinutes < 1 
          ? `${Math.floor(durationMs / 1000)} secondes`
          : `${Math.floor(durationMinutes)} minute${Math.floor(durationMinutes) > 1 ? 's' : ''}`
        
        // Afficher la boîte de dialogue de confirmation
        setConfirmDialogData({
          durationText,
          onCancel: async () => {
            // L'utilisateur a annulé, on arrête quand même le timer mais sans sauvegarder
            await stopTimer()
            showTimerNotification('stop', currentTaskName || 'Tâche inconnue')
            setConfirmDialogData(null)
          },
          onConfirm: async () => {
            try {
              const savedSession = await createSession(sessionData)
              
              if (!savedSession) {
                throw new Error('La réponse du serveur est vide')
              }
              
            } catch (err) {
              console.error('❌ Erreur lors de la création de la session courte:', err)
              error('Erreur lors de la sauvegarde de la session. Veuillez réessayer.')
              return // Ne pas arrêter le timer si la sauvegarde échoue
            }
            await stopTimer()
            showTimerNotification('stop', currentTaskName || 'Tâche inconnue')
            setConfirmDialogData(null)
          },
          taskName: currentTaskName || 'Tâche inconnue'
        })
        
        return
      }
      
      // Session normale (>= 5 minutes), sauvegarder directement
      try {
        const savedSession = await createSession(sessionData)
        
        if (!savedSession) {
          throw new Error('La réponse du serveur est vide')
        }
        
      } catch (err) {
        console.error('❌ Erreur lors de la création de la session:', err)
        // Afficher l'erreur à l'utilisateur
        error('Erreur lors de la sauvegarde de la session. Veuillez réessayer.')
        return // Ne pas arrêter le timer si la sauvegarde échoue
      }
    }
    
    await stopTimer()
    showTimerNotification('stop', currentTaskName || 'Tâche inconnue')
  }

  const handlePauseTimer = () => {
    pauseTimer()
    showTimerNotification('pause', state.currentTaskName || 'Tâche inconnue')
  }

  const handleResumeTimer = () => {
    resumeTimer()
    showTimerNotification('start', state.currentTaskName || 'Tâche inconnue')
  }

  const handleQuickStart = (task: BackendTaskWithRelations) => {
    const domainObj = domains.find((d) => d.name === task.domain?.name)
    
    if (domainObj) {
      setSelectedDomain(domainObj.id)
      
      // Gérer le sous-domaine uniquement s'il existe
      if (task.subdomain?.name) {
        const subdomainObj = domainObj.subdomains.find((sd: { id: string; name: string }) => sd.name === task.subdomain?.name)
        if (subdomainObj) {
          setSelectedSubdomain(subdomainObj.id)
        }
      } else {
        setSelectedSubdomain('')
      }
      
      setTaskName(task.title)
      setTaskDescription(task.description || '')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Chronomètre principal en haut-centre */}
      <div className="text-center space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-lg">
          <div className="text-7xl font-mono font-bold text-gray-900 mb-4 tracking-wider">
            {formatElapsedTime(state.elapsed)}
          </div>

          {!isIdle && (
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800">{state.currentTaskName}</h2>
              <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                <span>{state.currentDomain}</span>
                <span className="text-gray-400">|</span>
                <span>{state.currentSubdomain}</span>
              </div>
              {state.currentDescription && (
                <p className="text-gray-500 text-sm mt-2">{state.currentDescription}</p>
              )}
            </div>
          )}

          {isIdle && (
            <div className="text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-lg">Prêt à démarrer</p>
            </div>
          )}
        </div>

        {/* Contrôles du chronomètre */}
        <div className="flex justify-center gap-4">
          {isIdle && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg"
              onClick={() => setShowTaskForm(true)}
              size="lg"
            >
              <Play className="h-6 w-6 mr-2" />
              Démarrer
            </Button>
          )}

          {isRunning && (
            <>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg"
                onClick={handlePauseTimer}
                size="lg"
                variant="outline"
              >
                <Pause className="h-6 w-6 mr-2" />
                Pause
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white border-red-500 px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg"
                onClick={handleStopTimer}
                size="lg"
                variant="outline"
              >
                <Square className="h-6 w-6 mr-2" />
                Arrêter
              </Button>
            </>
          )}

          {isPaused && (
            <>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg"
                onClick={handleResumeTimer}
                size="lg"
              >
                <Play className="h-6 w-6 mr-2" />
                Reprendre
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white border-red-500 px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg"
                onClick={handleStopTimer}
                size="lg"
                variant="outline"
              >
                <Square className="h-6 w-6 mr-2" />
                Arrêter
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sélection de tâche compacte */}
      {(showTaskForm || isIdle) && (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Nouvelle session
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Domaine */}
                <div className="space-y-2">
                  <Label htmlFor="domain">Domaine</Label>
                  <Select
                    onValueChange={(value) => {
                      setSelectedDomain(value)
                      setSelectedSubdomain('')
                      setTaskName('')
                      setTaskDescription('')
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

                {/* Sous-domaine - Affiché uniquement si le domaine sélectionné a des sous-domaines */}
                {domainHasSubdomains && (
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Sous-domaine</Label>
                    <Select
                      disabled={!selectedDomain}
                      onValueChange={(value) => {
                        setSelectedSubdomain(value)
                        setTaskName('')
                        setTaskDescription('')
                      }}
                      value={selectedSubdomain}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un sous-domaine" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubdomains.map((subdomain: { id: string; name: string }) => (
                        <SelectItem key={subdomain.id} value={subdomain.id}>
                          {subdomain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                )}
              </div>

              {/* Nom de la tâche */}
              <div className="space-y-2">
                <Label htmlFor="taskName">Nom de la tâche</Label>
                <Select
                  disabled={!selectedDomain || availableTasks.length === 0}
                  onValueChange={(value) => {
                    const selectedTask = availableTasks.find(t => t.title === value)
                    setTaskName(value)
                    if (selectedTask) {
                      setTaskDescription(selectedTask.description || '')
                    }
                  }}
                  value={taskName}
                >
                  <SelectTrigger className="text-lg p-3">
                    <SelectValue placeholder={
                      !selectedDomain ? "Sélectionnez d'abord un domaine" :
                      availableTasks.length === 0 ? "Aucune tâche disponible" :
                      "Choisir une tâche..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((task) => (
                      <SelectItem key={task.id} value={task.title}>
                        <div className="flex flex-col">
                          <span className="font-medium">{task.title}</span>
                          {task.description && (
                            <span className="text-sm text-gray-500">{task.description}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    {availableTasks.length === 0 && selectedDomain && (selectedSubdomain || !domainHasSubdomains) && (
                      <div className="px-2 py-1.5 text-sm text-gray-500 italic">
                        Aucune tâche disponible pour cette combinaison
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Description optionnelle */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input
                  id="description"
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Détails supplémentaires..."
                  value={taskDescription}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                  disabled={!selectedDomain || !taskName.trim()}
                  onClick={handleStartTimer}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Démarrer le chronomètre
                </Button>
                {showTaskForm && isIdle && (
                  <Button className="px-6" onClick={() => setShowTaskForm(false)} variant="outline">
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tâches récentes pour démarrage rapide */}
      {isIdle && recentTasks.length > 0 && (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tâches récentes
            </h3>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  key={task.id}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-500">
                      {task.domain?.name || 'Sans domaine'} / {task.subdomain?.name || 'Sans sous-domaine'}
                    </div>
                    {task.description && (
                      <div className="text-xs text-gray-400 mt-1">{task.description}</div>
                    )}
                  </div>
                  <Button
                    className="ml-4"
                    onClick={() => handleQuickStart(task)}
                    size="sm"
                    variant="outline"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Utiliser
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Boîte de dialogue de confirmation pour les sessions courtes */}
      <AlertDialog onOpenChange={(open) => !open && setConfirmDialogData(null)} open={!!confirmDialogData}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session courte détectée</AlertDialogTitle>
            <AlertDialogDescription>
              La session "{confirmDialogData?.taskName}" ne dure que {confirmDialogData?.durationText}. 
              <br />
              Voulez-vous vraiment la sauvegarder ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={confirmDialogData?.onCancel}>
              Ne pas sauvegarder
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialogData?.onConfirm}>
              Sauvegarder quand même
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default TimerView
