import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TaskEntryProps {
  task: {
    id: string
    name: string
    startTime: string
    endTime: string
    domain: string
    subdomain: string
    description: string
  }
  onRemove: (id: string) => void
}

const TaskEntry = ({ task, onRemove }: TaskEntryProps) => {
  return (
    <div className="border rounded-md p-4 relative">
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => onRemove(task.id)}
      >
        <X size={14} />
      </Button>

      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <span className="text-sm text-muted-foreground">ID:</span> {task.id}
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Horaire:</span> {task.startTime} -{' '}
          {task.endTime}
        </div>
      </div>

      <div className="font-medium text-lg mb-2">{task.name}</div>

      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <span className="text-sm text-muted-foreground">Domaine:</span> {task.domain}
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Sous-domaine:</span> {task.subdomain}
        </div>
      </div>

      {task.description && (
        <div className="mt-2 text-sm text-muted-foreground">{task.description}</div>
      )}
    </div>
  )
}

export default TaskEntry
