import React, { useState } from 'react'
import { toast } from 'sonner'

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { type TaskFormData, useTasksManagement } from '@/hooks/useTasksManagement'
import { BackendDomainWithSubdomains, BackendTaskWithRelations } from '@/types'

interface TasksTabProps {
  domains: BackendDomainWithSubdomains[]
  isLoading: boolean
  tasks: BackendTaskWithRelations[]
}

// Update task status options to match domain
const TASK_STATUS_OPTIONS = [
  { label: 'En attente', value: 'pending' },
  { label: 'En cours', value: 'in_progress' },
  { label: 'Terminé', value: 'completed' },
  { label: 'Annulé', value: 'cancelled' },
] as const

export const TasksTab = ({ domains, tasks: initialTasks = [] }: TasksTabProps) => {
  const { addTask, deleteTask, isLoading, tasks, updateTask } = useTasksManagement(initialTasks)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<BackendTaskWithRelations | null>(null)
  const [newTask, setNewTask] = useState<TaskFormData & { id?: string }>({
    description: '',
    domainId: '',
    status: 'pending',
    subDomainId: null,
    title: '',
  })

  const handleEditTask = (task: BackendTaskWithRelations) => {
    setEditingTask(task)
    setIsEditTaskOpen(true)
  }

  const handleSaveTaskEdit = async () => {
    if (!editingTask) return

    try {
      // If no subdomain selected, keep it null regardless of domain structure
      if (!editingTask.subDomainId) {
        editingTask.subDomainId = null
      }

      await updateTask(editingTask.id, {
        description: editingTask.description || undefined,
        domainId: editingTask.domainId || '',
        status: editingTask.status || 'pending',
        subDomainId: editingTask.subDomainId,
        title: editingTask.title,
      })

      // No need to update local state - the hook will handle data updates
      setIsEditTaskOpen(false)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.domainId) {
      toast.error('Le nom de la tâche et le domaine sont requis')
      return
    }

    // Allow creating a task with a domain only (even if domain has subdomains)
    // If no subdomain selected, keep it null
    if (!newTask.subDomainId) {
      newTask.subDomainId = null
    }

    try {
      await addTask({
        description: newTask.description,
        domainId: newTask.domainId,
        status: newTask.status || 'pending',
        subDomainId: newTask.subDomainId,
        title: newTask.title,
      })

      // No need to update local state - the hook will handle data updates
      setNewTask({
        description: '',
        domainId: '',
        status: 'pending',
        subDomainId: null,
        title: '',
      })
      setIsAddTaskOpen(false)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleDeleteTask = async () => {
    if (!editingTask) return

    try {
      await deleteTask(editingTask.id)

      // No need to update local state - the hook will handle data updates
      setIsDeleteTaskDialogOpen(false)
      setIsEditTaskOpen(false)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">Tâches créées</h3>
      <p className="text-sm text-muted-foreground">
        Gestion des tâches prédéfinies dans l'application.
      </p>

      <div className="mb-4">
        <Button
          disabled={domains.length === 0 || isLoading}
          onClick={() => {
            if (domains.length === 0) {
              toast.error("Veuillez d'abord créer au moins un domaine")
              return
            }
            setIsAddTaskOpen(true)
          }}
        >
          Ajouter une tâche
        </Button>
        {domains.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Vous devez créer au moins un domaine avant de pouvoir ajouter des tâches
          </p>
        )}
      </div>

      <div className="overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Domaine</TableHead>
              <TableHead>Sous-domaine</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task: BackendTaskWithRelations, index) => {
              const statusOption = TASK_STATUS_OPTIONS.find((s) => s.value === task.status)

              // Utiliser directement les relations incluses dans la tâche
              const domainName = task.domain?.name || 'Domaine introuvable'
              const subdomainName = task.subdomain?.name || '-'

              // Utiliser un fallback unique pour la clé en cas de problème
              const uniqueKey = task.id || `task-${index}`

              return (
                <TableRow key={uniqueKey}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{domainName}</TableCell>
                  <TableCell>{subdomainName}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : task.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusOption?.label || task.status || 'En attente'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs whitespace-pre-wrap break-words text-sm">
                      {task.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                      disabled={isLoading}
                      onClick={() => handleEditTask(task)}
                      size="sm"
                      variant="outline"
                    >
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog onOpenChange={setIsDeleteTaskDialogOpen} open={isDeleteTaskDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette tâche?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. La tâche et toutes les sessions associées
              seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteTaskDialogOpen(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={handleDeleteTask}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog onOpenChange={setIsEditTaskOpen} open={isEditTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="taskId">
                  ID
                </Label>
                <Input
                  className="col-span-3 bg-gray-50 cursor-not-allowed"
                  id="taskId"
                  readOnly
                  value={editingTask.id}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="taskName">
                  Nom
                </Label>
                <Input
                  className="col-span-3"
                  id="taskName"
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  value={editingTask.title}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="taskDomain">
                  Domaine
                </Label>
                <Select
                  onValueChange={(value) =>
                    setEditingTask({ ...editingTask, domainId: value, subDomainId: null })
                  }
                  value={editingTask.domainId || ''}
                >
                  <SelectTrigger className="col-span-3">
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
              {editingTask.domainId && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="taskSubdomain">
                    Sous-domaine
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setEditingTask({
                        ...editingTask,
                        subDomainId: value === 'none' ? null : value,
                      })
                    }
                    value={editingTask.subDomainId || 'none'}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un sous-domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun sous-domaine</SelectItem>
                      {domains
                        .find((d) => d.id === editingTask.domainId)
                        ?.subdomains.map((subdomain: any) => (
                          <SelectItem key={subdomain.id} value={subdomain.id}>
                            {subdomain.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="taskStatus">
                  Statut
                </Label>
                <Select
                  onValueChange={(value) =>
                    setEditingTask({
                      ...editingTask,
                      status: value as 'cancelled' | 'completed' | 'in_progress' | 'pending',
                    })
                  }
                  value={editingTask.status || 'pending'}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2" htmlFor="taskDescription">
                  Description
                </Label>
                <Textarea
                  className="col-span-3 min-h-[80px] resize-y"
                  id="taskDescription"
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  placeholder="Description de la tâche"
                  value={editingTask.description || ''}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <div>
              <Button
                disabled={isLoading}
                onClick={() => setIsDeleteTaskDialogOpen(true)}
                variant="destructive"
              >
                Supprimer
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsEditTaskOpen(false)} variant="outline">
                Annuler
              </Button>
              <Button disabled={isLoading} onClick={handleSaveTaskEdit}>
                Enregistrer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setIsAddTaskOpen} open={isAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle tâche</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="newTaskName">
                Nom
              </Label>
              <Input
                className="col-span-3"
                id="newTaskName"
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                value={newTask.title}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="newTaskDomain">
                Domaine
              </Label>
              <Select
                onValueChange={(value) => {
                  setNewTask({ ...newTask, domainId: value, subDomainId: null })
                }}
                value={newTask.domainId}
              >
                <SelectTrigger className="col-span-3">
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
            {newTask.domainId &&
              domains.find((d) => d.id === newTask.domainId)?.subdomains.length! > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="newTaskSubdomain">
                    Sous-domaine
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, subDomainId: value === 'none' ? null : value })
                    }
                    value={newTask.subDomainId || 'none'}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un sous-domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun sous-domaine</SelectItem>
                      {domains
                        .find((d) => d.id === newTask.domainId)
                        ?.subdomains.map((subdomain: any) => (
                          <SelectItem key={subdomain.id} value={subdomain.id}>
                            {subdomain.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="newTaskStatus">
                Statut
              </Label>
              <Select
                onValueChange={(value) => {
                  setNewTask({
                    ...newTask,
                    status: value as 'cancelled' | 'completed' | 'in_progress' | 'pending',
                  })
                }}
                value={newTask.status || 'pending'}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2" htmlFor="newTaskDescription">
                Description
              </Label>
              <Textarea
                className="col-span-3 min-h-[80px] resize-y"
                id="newTaskDescription"
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Description de la tâche"
                value={newTask.description || ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddTaskOpen(false)} variant="outline">
              Annuler
            </Button>
            <Button disabled={isLoading} onClick={handleAddTask}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
