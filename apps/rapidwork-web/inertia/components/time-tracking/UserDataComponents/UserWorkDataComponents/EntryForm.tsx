import { AlertCircle, Check } from 'lucide-react'
import React from 'react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Domain, Task } from '@/lib/mock_data'
import { cn } from '@/lib/utils'

interface EntryFormProps {
  availableTasks: Task[]
  domains: Domain[]
  formData: {
    description: string
    domain: string
    endTime: string
    startTime: string
    subdomain: string
    taskId: string
    taskName: string
  }
  handleInputChange: (field: string, value: string) => void
  isNewTask: boolean
  matchingTask: null | Task
  selectedDomain: string
  setTaskIdInputOpen: (open: boolean) => void
  taskIdInputOpen: boolean
}

const EntryForm = ({
  availableTasks,
  domains,
  formData,
  handleInputChange,
  isNewTask,
  matchingTask,
  selectedDomain,
  setTaskIdInputOpen,
  taskIdInputOpen,
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
            <Popover onOpenChange={setTaskIdInputOpen} open={taskIdInputOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    className={cn(
                      matchingTask && 'border-green-500 pr-8',
                      !matchingTask && formData.taskId && 'border-red-500 pr-8'
                    )}
                    onChange={(e) => handleInputChange('taskId', e.target.value)}
                    onClick={() => setTaskIdInputOpen(true)}
                    placeholder="Entrez un ID de tâche"
                    value={formData.taskId}
                  />
                  {matchingTask && (
                    <Check className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                  )}
                  {!matchingTask && formData.taskId && (
                    <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-red-500" />
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0" side="bottom">
                <Command>
                  <CommandInput placeholder="Rechercher une tâche..." />
                  <CommandList>
                    <CommandEmpty>Aucune tâche trouvée</CommandEmpty>
                    <CommandGroup>
                      {availableTasks.map((task) => (
                        <CommandItem
                          key={task.id}
                          onSelect={() => handleTaskIdSelect(task.id)}
                          value={task.id}
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
              className={cn(matchingTask && 'bg-muted cursor-not-allowed')}
              onChange={(e) => handleInputChange('taskName', e.target.value)}
              readOnly={!!matchingTask}
              value={formData.taskName}
            />
          </div>
        </div>
      )}

      {isNewTask && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Nom Tâche</label>
          <Input
            onChange={(e) => handleInputChange('taskName', e.target.value)}
            placeholder="Nom de la nouvelle tâche"
            value={formData.taskName}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Heure Début</label>
          <Input
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            type="time"
            value={formData.startTime}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Heure Fin</label>
          <Input
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            type="time"
            value={formData.endTime}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Domaine</label>
          <Select
            disabled={!isNewTask && !!matchingTask}
            onValueChange={handleDomainChange}
            value={formData.domain}
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
            disabled={(!isNewTask && !!matchingTask) || !selectedDomain}
            onValueChange={handleSubdomainChange}
            value={formData.subdomain}
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
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          value={formData.description}
        />
      </div>
    </div>
  )
}

export default EntryForm
