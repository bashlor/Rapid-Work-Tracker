import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useTasksManagement, type TaskFormData } from '@/hooks/useTasksManagement'
import { BackendDomainWithSubdomains, BackendTaskWithRelations } from '@/types'

interface TasksTabProps {
  domains: BackendDomainWithSubdomains[]
  tasks: BackendTaskWithRelations[]
  isLoading: boolean
}

// Update task status options to match domain
const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' }
] as const

export const TasksTab = ({ domains, tasks: initialTasks = []}: TasksTabProps) => {
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useTasksManagement(initialTasks)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<BackendTaskWithRelations | null>(null)
  const [newTask, setNewTask] = useState<TaskFormData & { id?: string }>({
    title: '',
    domainId: '',
    subDomainId: null,
    description: '',
    status: 'pending',
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
        title: editingTask.title,
        description: editingTask.description || undefined,
        domainId: editingTask.domainId || '',
        subDomainId: editingTask.subDomainId,
        status: editingTask.status || 'pending',
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
        title: newTask.title,
        description: newTask.description,
        domainId: newTask.domainId,
        subDomainId: newTask.subDomainId,
        status: newTask.status || 'pending',
      })

      // No need to update local state - the hook will handle data updates
      setNewTask({
        title: '',
        domainId: '',
        subDomainId: null,
        description: '',
        status: 'pending',
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
          onClick={() => {
            if (domains.length === 0) {
              toast.error("Veuillez d'abord créer au moins un domaine")
              return
            }
            setIsAddTaskOpen(true)
          }}
          disabled={domains.length === 0 || isLoading}
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
              const statusOption = TASK_STATUS_OPTIONS.find(s => s.value === task.status)
              
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
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
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
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditTask(task)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                      disabled={isLoading}
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

      <AlertDialog open={isDeleteTaskDialogOpen} onOpenChange={setIsDeleteTaskDialogOpen}>
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
            <AlertDialogAction
              onClick={handleDeleteTask}
              disabled={isLoading}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taskId" className="text-right">
                  ID
                </Label>
                <Input
                  id="taskId"
                  value={editingTask.id}
                  className="col-span-3 bg-gray-50 cursor-not-allowed"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taskName" className="text-right">
                  Nom
                </Label>
                <Input
                  id="taskName"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taskDomain" className="text-right">
                  Domaine
                </Label>
                <Select
                  value={editingTask.domainId || ''}
                  onValueChange={(value) => 
                    setEditingTask({ ...editingTask, domainId: value, subDomainId: null })
                  }
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
                  <Label htmlFor="taskSubdomain" className="text-right">
                    Sous-domaine
                  </Label>
                  <Select
                    value={editingTask.subDomainId || 'none'}
                    onValueChange={(value) =>
                      setEditingTask({ ...editingTask, subDomainId: value === 'none' ? null : value })
                    }
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
                <Label htmlFor="taskStatus" className="text-right">
                  Statut
                </Label>
                <Select
                  value={editingTask.status || 'pending'}
                  onValueChange={(value) => 
                    setEditingTask({ ...editingTask, status: value as 'pending' | 'in_progress' | 'completed' | 'cancelled' })
                  }
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
                <Label htmlFor="taskDescription" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="taskDescription"
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="col-span-3 min-h-[80px] resize-y"
                  placeholder="Description de la tâche"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <div>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteTaskDialogOpen(true)}
                disabled={isLoading}
              >
                Supprimer
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveTaskEdit} disabled={isLoading}>
                Enregistrer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle tâche</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newTaskName" className="text-right">
                Nom
              </Label>
              <Input
                id="newTaskName"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newTaskDomain" className="text-right">
                Domaine
              </Label>
              <Select
                value={newTask.domainId}
                onValueChange={(value) => {
                  setNewTask({ ...newTask, domainId: value, subDomainId: null })
                }}
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
                  <Label htmlFor="newTaskSubdomain" className="text-right">
                    Sous-domaine
                  </Label>
                  <Select
                    value={newTask.subDomainId || 'none'}
                    onValueChange={(value) => setNewTask({ ...newTask, subDomainId: value === 'none' ? null : value })}
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
              <Label htmlFor="newTaskStatus" className="text-right">
                Statut
              </Label>
              <Select
                value={newTask.status || 'pending'}
                onValueChange={(value) => {
                  setNewTask({ ...newTask, status: value as 'pending' | 'in_progress' | 'completed' | 'cancelled' })
                }}
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
              <Label htmlFor="newTaskDescription" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="newTaskDescription"
                value={newTask.description || ''}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="col-span-3 min-h-[80px] resize-y"
                placeholder="Description de la tâche"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddTask} disabled={isLoading}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
