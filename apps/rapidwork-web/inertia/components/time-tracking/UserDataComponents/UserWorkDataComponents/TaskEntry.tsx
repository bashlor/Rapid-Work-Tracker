import { X } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'

interface TaskEntryProps {
  onRemove: (id: string) => void
  task: {
    description: string
    domain: string
    endTime: string
    id: string
    name: string
    startTime: string
    subdomain: string
  }
}

const TaskEntry = ({ onRemove, task }: TaskEntryProps) => {
  return (
    <div className="border rounded-md p-4 relative">
      <Button
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => onRemove(task.id)}
        size="icon"
        variant="destructive"
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
