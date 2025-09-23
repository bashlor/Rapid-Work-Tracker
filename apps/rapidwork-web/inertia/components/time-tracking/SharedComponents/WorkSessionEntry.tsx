import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

import type { BackendDomainWithSubdomains, BackendTaskWithRelations } from '@/types/backend'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useWorkSession } from '@/contexts/WorkSessionContext'
import { useDomainsManagement } from '@/hooks/useDomainsManagement'
import { useNotification } from '@/hooks/useNotification'
import { useSessionsManagement } from '@/hooks/useSessionsManagement'
import { useTasksManagement } from '@/hooks/useTasksManagement'
import { formatTimeDisplay, localInputToUtcIso } from '@/utils/datetime'

// Interface pour une session de travail
export interface WorkSession {
  description: string // Description de la session
  domainId: string
  domainName: string
  endDateTime: string // Format ISO: "2025-01-24T11:00"
  id: string
  isNew: boolean
  startDateTime: string // Format ISO: "2025-01-24T09:00"
  subdomainId?: string
  subdomainName?: string
  taskId: string
  taskName: string
  useSubdomain: boolean
}

interface WorkSessionEntryProps {
  onDelete: (sessionId: string) => void
  onDuplicate?: (session: WorkSession) => void
  onSave: (session: WorkSession) => void
  session: WorkSession
}

const WorkSessionEntry: React.FC<WorkSessionEntryProps> = ({
  onDelete,
  onDuplicate,
  onSave,
  session,
}) => {
  // Utilisation des hooks pour récupérer les domaines et tâches
  const { domains, loading: domainsLoading } = useDomainsManagement()
  const { loading: tasksLoading, tasks } = useTasksManagement()
  const { error, success } = useNotification()
  
  // Hook pour les appels API de sessions
  const { createSession, updateSession } = useSessionsManagement(new Date())

  // Hook pour le contexte des sessions de travail (pour les types seulement)
  useWorkSession()

  const [formData, setFormData] = useState<WorkSession>(session)
  const [isSaving, setIsSaving] = useState(false)
  const [isExpanded, setIsExpanded] = useState(session.isNew) // Expandé si nouvelle session, sinon collapsé

  // Handler générique pour les changements simples de formData
  const handleFormDataChange = (updates: Partial<WorkSession>) => {
    const newFormData = { ...formData, ...updates }
    setFormData(newFormData)
    
    // Notifier le parent immédiatement pour que le contexte puisse détecter les changements
    onSave(newFormData)
  }

  // Calculs dérivés après les hooks
  const selectedDomain = (domains as BackendDomainWithSubdomains[]).find((d) => d.id === formData.domainId)
  const availableSubdomains = selectedDomain?.subdomains || []

  // Filtrer les tâches selon plusieurs critères
  const availableTasks = useMemo(() => {
    return (tasks as BackendTaskWithRelations[]).filter((task) => {
      // Vérifier d'abord que la tâche appartient au domaine sélectionné
      const belongsToDomain = task.domainId === formData.domainId
      
      if (!belongsToDomain) return false
      
      // Vérifier si le domaine a des sous-domaines
      const domainHasSubdomains = availableSubdomains.length > 0
      
      // Si un sous-domaine est sélectionné ET utilisé, filtrer par sous-domaine
      if (formData.useSubdomain && formData.subdomainId) {
        const belongsToSubdomain = task.subDomainId === formData.subdomainId
        if (!belongsToSubdomain) return false
      }
      // Si le flag useSubdomain est activé mais aucun sous-domaine n'est sélectionné,
      // montrer seulement les tâches qui n'ont PAS de sous-domaine (appartiennent directement au domaine)
      else if (formData.useSubdomain && !formData.subdomainId) {
        // Si le domaine a des sous-domaines, montrer toutes les tâches du domaine
        if (domainHasSubdomains) {
          // Permettre toutes les tâches du domaine
        } else {
          // Si pas de sous-domaines dans le domaine, montrer seulement les tâches sans sous-domaine
          if (task.subDomainId) return false
        }
      }
      // Si useSubdomain est false, montrer toutes les tâches du domaine
      // (avec ou sans sous-domaine)
      
      // Filtrer par statut : seulement pending et in_progress
      const validStatuses = ['pending', 'in_progress']
      const taskStatus = task.status || 'pending'
      
      return validStatuses.includes(taskStatus)
    })
  }, [tasks, formData.domainId, formData.useSubdomain, formData.subdomainId, availableSubdomains])

  // Initial hydration: if taskId is set but domain not, infer from tasks
  useEffect(() => {
    if (formData.taskId && !formData.domainId && (tasks as BackendTaskWithRelations[]).length > 0) {
      const t: BackendTaskWithRelations | undefined = (tasks as BackendTaskWithRelations[]).find((x) => x.id === formData.taskId)
      if (t) {
        const domainId = t.domainId || ''
        const subDomainId = t.subDomainId || ''
        const domain = (domains as BackendDomainWithSubdomains[]).find((d) => d.id === domainId)
        const sub = domain?.subdomains?.find((s) => s.id === subDomainId)
        setFormData((prev) => ({
          ...prev,
          // Assurer que la description a une valeur par défaut
          description: prev.description || '',
          domainId,
          domainName: domain?.name || '',
          subdomainId: subDomainId || '',
          subdomainName: sub?.name || '',
          taskName: t.title || '',
          useSubdomain: !!subDomainId,
        }))
      }
    }
  }, [formData.taskId, formData.domainId, tasks, domains])


  const handleDomainChange = (domainId: string) => {
    const domain = (domains as BackendDomainWithSubdomains[]).find((d) => d.id === domainId)
    handleFormDataChange({
      domainId,
      domainName: domain?.name || '',
      subdomainId: '',
      subdomainName: '',
      taskId: '',
      taskName: '',
    })
  }

  const handleSubdomainChange = (subdomainId: string) => {
    const subdomain = availableSubdomains.find((s: any) => s.id === subdomainId)
    handleFormDataChange({
      subdomainId,
      subdomainName: subdomain?.name || '',
      taskId: '', // Réinitialiser la tâche car les tâches disponibles changent  
      taskName: '',
    })
  }

  const handleTaskChange = (taskId: string) => {
    const task = availableTasks.find((t: any) => t.id === taskId)
    const taskName = task?.title || ''
    handleFormDataChange({
      // Pré-remplir avec la description par défaut que l'utilisateur peut modifier
      description: `Session: ${taskName}`,
      taskId,
      taskName,
    })
  }

  const handleUseSubdomainChange = (checked: boolean) => {
    handleFormDataChange({
      subdomainId: checked ? formData.subdomainId : '',
      subdomainName: checked ? formData.subdomainName : '',
      taskId: '', // Réinitialiser la tâche car les tâches disponibles changent
      taskName: '',
      useSubdomain: checked,
    })
  }

  const handleSave = async () => {

    
    // Validation
    if (
      !formData.domainId ||
      !formData.taskId ||
      !formData.startDateTime ||
      !formData.endDateTime
    ) {
      error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (formData.useSubdomain && !formData.subdomainId) {
      error('Veuillez sélectionner un sous-domaine')
      return
    }

    // Validation des dates
    const startDate = new Date(formData.startDateTime)
    const endDate = new Date(formData.endDateTime)

    if (endDate <= startDate) {
      error("L'heure de fin doit être après l'heure de début")
      return
    }

    setIsSaving(true)

    try {
      // Calculer la durée en minutes
      const duration = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / 60000))

      const sessionData = {
        description: formData.description || `Session: ${formData.taskName}`,
        duration,
        endTime: localInputToUtcIso(formData.endDateTime),
        startTime: localInputToUtcIso(formData.startDateTime),
        taskId: formData.taskId,
      }

      if (formData.isNew) {
        // Nouvelle session - appeler createSession
        const newSession = await createSession(sessionData)
        
        // Mettre à jour l'état local avec les données de l'API
        const updatedFormData = {
          ...formData,
          id: newSession.id,
          isNew: false,
        }
        setFormData(updatedFormData)
        
        // Notifier le parent que la session a été sauvegardée
        onSave(updatedFormData)
        
        success('Session créée avec succès')
      } else {
        
        await updateSession(formData.id, {
          description: sessionData.description,
          duration: sessionData.duration,
          endTime: sessionData.endTime,
          startTime: sessionData.startTime,
          taskId: formData.taskId,
        })
        
        // Notifier le parent que la session a été mise à jour
        onSave(formData)
        
        success('Session mise à jour avec succès')
      }

    } catch (err) {
      console.error('❌ Error saving session:', err)
      error('Erreur lors de la sauvegarde de la session')
    } finally {
      setIsSaving(false)
      console.groupEnd()
    }
  }

  const handleDelete = () => {
    onDelete(formData.id)
    // Pas de toast ici - seulement lors de la sauvegarde globale
  }

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(formData)
    }
  }

  // Calculer la durée
  const calculateDuration = () => {
    if (!formData.startDateTime || !formData.endDateTime) return null

    const start = new Date(formData.startDateTime)
    const end = new Date(formData.endDateTime)

    if (end <= start) return null

    const durationMs = end.getTime() - start.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)

    // Construire l'affichage selon la durée
    const parts = []
    if (hours > 0) {
      parts.push(`${hours} heure${hours > 1 ? 's' : ''}`)
    }
    if (minutes > 0) {
      parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
    }
    if (seconds > 0 || (hours === 0 && minutes === 0)) {
      parts.push(`${seconds} seconde${seconds > 1 ? 's' : ''}`)
    }

    return parts.join(', ')
  }

  // Validation en temps réel
  const hasValidationErrors = () => {
    if (
      !formData.domainId ||
      !formData.taskId ||
      !formData.startDateTime ||
      !formData.endDateTime
    ) {
      return true
    }
    if (formData.useSubdomain && !formData.subdomainId) {
      return true
    }
    const startDate = new Date(formData.startDateTime)
    const endDate = new Date(formData.endDateTime)
    return endDate <= startDate
  }

  // Calculer toutes les valeurs dérivées avant le return conditionnel
  const duration = calculateDuration()
  const hasErrors = hasValidationErrors()

  // Formatted display: "Domain / Sous-domaine / Tâche - HH:mm - HH:mm"
  const headerLabel = useMemo(() => {
    const domainPart = formData.domainName || (domains as BackendDomainWithSubdomains[]).find((d) => d.id === formData.domainId)?.name || ''
    const subdomainPart = formData.useSubdomain
      ? formData.subdomainName || availableSubdomains.find((s) => s.id === formData.subdomainId)?.name || ''
      : ''
    const task = (tasks as BackendTaskWithRelations[]).find((t) => t.id === formData.taskId)
    const taskPart = formData.taskName || task?.title || ''
    const fmt = (val: string | undefined) => (val ? formatTimeDisplay(val) : '')
    const start = fmt(formData.startDateTime)
    const end = fmt(formData.endDateTime)
    const left = [domainPart, subdomainPart, taskPart].filter(Boolean).join(' / ')
    const right = [start, end].filter(Boolean).join(' - ')
    return left && right ? `${left} - ${right}` : left || right || ''
  }, [formData, domains, availableSubdomains, tasks])

  if (domainsLoading || tasksLoading) {
    return <div>Chargement...</div>
  }

  const cardClasses = [
    'bg-white shadow-sm',
    formData.isNew ? 'border-2 border-dashed border-slate-300' : 'border border-slate-200',
  ].join(' ')

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Version collapsée - seulement le header
  if (!isExpanded) {
    return (
      <Card className={cardClasses}>
        <CardContent className="p-4">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded p-2 -m-2"
            onClick={toggleExpanded}
          >
            <div className="flex items-center space-x-3">
              <ChevronDown className="h-4 w-4 text-slate-500" />
              <div className="text-sm text-slate-700">
                {headerLabel || 'Session de travail'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Session existante
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Version complète (expandée)

  return (
    <Card className={cardClasses}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header avec bouton collapse/expand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                onClick={toggleExpanded}
                type="button"
              >
                <ChevronUp className="h-4 w-4 text-slate-500" />
              </button>
              {headerLabel && (
                <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded px-3 py-2">
                  {headerLabel}
                </div>
              )}
            </div>
            <div>
              {formData.isNew ? (
                <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Nouvelle session (non sauvegardée)
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Session existante
                </span>
              )}
            </div>
          </div>
          {/* headerLabel is already shown in the badge row above */}
          {/* Section 1: Sélection du domaine et sous-domaine */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              📁 Domaine et sous-domaine
            </h3>

            {/* Checkbox en haut */}
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={formData.useSubdomain}
                id={`use-subdomain-${formData.id}`}
                onCheckedChange={handleUseSubdomainChange}
              />
              <Label
                className="text-sm font-medium text-slate-700"
                htmlFor={`use-subdomain-${formData.id}`}
              >
                Utiliser un sous-domaine
              </Label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sélection du domaine */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Domaine *</Label>
                <Select onValueChange={handleDomainChange} value={formData.domainId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choisir un domaine..." />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain: any) => (
                      <SelectItem key={domain.id} value={domain.id}>
                        {domain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sélection sous-domaine alignée */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  {formData.useSubdomain ? 'Sous-domaine *' : 'Sous-domaine'}
                </Label>
                {formData.useSubdomain && formData.domainId ? (
                  <Select onValueChange={handleSubdomainChange} value={formData.subdomainId || ''}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choisir un sous-domaine..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubdomains.map((subdomain: any) => (
                        <SelectItem key={subdomain.id} value={subdomain.id}>
                          {subdomain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-11 bg-gray-50 border border-gray-200 rounded-md flex items-center px-3 text-sm text-gray-500">
                    {formData.useSubdomain ? 'Sélectionnez d\'abord un domaine' : 'Non utilisé'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Sélection de la tâche */}
          {formData.domainId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                📋 Tâche
              </h3>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Tâche *</Label>
                <Select onValueChange={handleTaskChange} value={formData.taskId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choisir une tâche..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.length > 0 ? (
                      availableTasks.map((task: any) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title || task.name || task.label}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-2 text-sm text-gray-500">
                        {formData.useSubdomain && !formData.subdomainId 
                          ? 'Sélectionnez d\'abord un sous-domaine'
                          : 'Aucune tâche active disponible (status: pending/in_progress)'}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Section 3: Description de la session */}
          {formData.taskId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                📝 Description
              </h3>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  Description de la session
                </Label>
                <Textarea
                  className="min-h-[80px] resize-y"
                  onChange={(e) =>
                    handleFormDataChange({ description: e.target.value })
                  }
                  placeholder="Décrivez ce que vous avez fait pendant cette session..."
                  rows={3}
                  value={formData.description}
                />
                <p className="text-xs text-gray-500">
                  Décrivez en détail ce que vous avez accompli pendant cette session de travail.
                </p>
              </div>
            </div>
          )}

          {/* Section 4: Période de travail */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              🕐 Période de travail
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Du *</Label>
                <Input
                  className="h-11"
                  onChange={(e) =>
                    handleFormDataChange({ startDateTime: e.target.value })
                  }
                  required
                  type="datetime-local"
                  value={formData.startDateTime}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Au *</Label>
                <Input
                  className="h-11"
                  onChange={(e) =>
                    handleFormDataChange({ endDateTime: e.target.value })
                  }
                  required
                  type="datetime-local"
                  value={formData.endDateTime}
                />
              </div>
            </div>

            {/* Durée calculée - Badge bien visible */}
            {duration && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Durée calculée</p>
                  <Badge className="bg-green-100 text-green-800 font-semibold" variant="secondary">
                    {duration}
                  </Badge>
                </div>
              </div>
            )}

            {/* Avertissement si erreur de validation */}
            {formData.startDateTime &&
              formData.endDateTime &&
              new Date(formData.endDateTime) <= new Date(formData.startDateTime) && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-medium text-red-800">
                    L'heure de fin doit être après l'heure de début
                  </p>
                </div>
              )}
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={hasErrors || isSaving}
              onClick={handleSave}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>

            {onDuplicate && (
              <Button onClick={handleDuplicate} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Dupliquer
              </Button>
            )}

            <Button onClick={handleDelete} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default WorkSessionEntry
