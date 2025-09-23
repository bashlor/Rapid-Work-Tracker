import React from 'react'

interface TaskItem {
  domain: string
  id: string
  name: string
  subdomain: string
  time: string
}

interface TasksTableProps {
  taskList: TaskItem[]
}

const TasksTable = ({ taskList }: TasksTableProps) => {
  return (
    <>
      <h3 className="text-md font-medium mb-4">Détail des tâches</h3>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                ID Tâche
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Heure
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Nom Tâche
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Domaine
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Sous-domaine
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border">
            {taskList.map((task) => (
              <tr key={task.id}>
                <td className="px-4 py-3 text-sm font-medium">{task.id}</td>
                <td className="px-4 py-3 text-sm">{task.time}</td>
                <td className="px-4 py-3 text-sm">{task.name}</td>
                <td className="px-4 py-3 text-sm">{task.domain}</td>
                <td className="px-4 py-3 text-sm">{task.subdomain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default TasksTable
