import React from 'react'
import { Input } from '@/components/ui/input'
import { AlertCircle, Check } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Task, Domain } from '@/lib/mock_data'

interface EntryFormProps {
  formData: {
    taskId: string
    taskName: string
    startTime: string
    endTime: string
    domain: string
    subdomain: string
    description: string
  }
  handleInputChange: (field: string, value: string) => void
  selectedDomain: string
  domains: Domain[]
  availableTasks: Task[]
  matchingTask: Task | null
  taskIdInputOpen: boolean
  setTaskIdInputOpen: (open: boolean) => void
  isNewTask: boolean
}

const EntryForm = ({
  formData,
  handleInputChange,
  selectedDomain,
  domains,
  availableTasks,
  matchingTask,
  taskIdInputOpen,
  setTaskIdInputOpen,
  isNewTask,
}: EntryFormProps) => {
  // Fonctions de gestion qui évitent les mises à jour en cascade
  const handleTaskIdSelect = (taskId: string) => {
    handleInputChange('taskId', taskId)
    setTaskIdInputOpen(false)
  }

  const handleDomainChange = (value: string) => {
    handleInputChange('domain', value)
  }

  const handleSubdomainChange = (value: string) => {
    handleInputChange('subdomain', value)
  }

  return (
    <div className="grid gap-4 py-4">
      {!isNewTask && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ID Tâche</label>
            <Popover open={taskIdInputOpen} onOpenChange={setTaskIdInputOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    value={formData.taskId}
                    onChange={(e) => handleInputChange('taskId', e.target.value)}
                    onClick={() => setTaskIdInputOpen(true)}
                    className={cn(
                      matchingTask && 'border-green-500 pr-8',
                      !matchingTask && formData.taskId && 'border-red-500 pr-8'
                    )}
                    placeholder="Entrez un ID de tâche"
                  />
                  {matchingTask && (
                    <Check className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                  )}
                  {!matchingTask && formData.taskId && (
                    <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-red-500" />
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start" side="bottom">
                <Command>
                  <CommandInput placeholder="Rechercher une tâche..." />
                  <CommandList>
                    <CommandEmpty>Aucune tâche trouvée</CommandEmpty>
                    <CommandGroup>
                      {availableTasks.map((task) => (
                        <CommandItem
                          key={task.id}
                          value={task.id}
                          onSelect={() => handleTaskIdSelect(task.id)}
                        >
                          <span className="font-medium">{task.id}</span>
                          <span className="ml-2 text-muted-foreground">- {task.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom Tâche</label>
            <Input
              value={formData.taskName}
              onChange={(e) => handleInputChange('taskName', e.target.value)}
              readOnly={!!matchingTask}
              className={cn(matchingTask && 'bg-muted cursor-not-allowed')}
            />
          </div>
        </div>
      )}

      {isNewTask && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Nom Tâche</label>
          <Input
            value={formData.taskName}
            onChange={(e) => handleInputChange('taskName', e.target.value)}
            placeholder="Nom de la nouvelle tâche"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Heure Début</label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Heure Fin</label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Domaine</label>
          <Select
            value={formData.domain}
            onValueChange={handleDomainChange}
            disabled={!isNewTask && !!matchingTask}
          >
            <SelectTrigger
              className={cn(!isNewTask && matchingTask && 'bg-muted cursor-not-allowed')}
            >
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Sous-domaine</label>
          <Select
            value={formData.subdomain}
            onValueChange={handleSubdomainChange}
            disabled={(!isNewTask && !!matchingTask) || !selectedDomain}
          >
            <SelectTrigger
              className={cn(!isNewTask && matchingTask && 'bg-muted cursor-not-allowed')}
            >
              <SelectValue placeholder="Sélectionner un sous-domaine" />
            </SelectTrigger>
            <SelectContent>
              {selectedDomain &&
                domains
                  .find((d) => d.id === selectedDomain)
                  ?.subdomains.map((subdomain) => (
                    <SelectItem key={subdomain.id} value={subdomain.id}>
                      {subdomain.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )
}

export default EntryForm
