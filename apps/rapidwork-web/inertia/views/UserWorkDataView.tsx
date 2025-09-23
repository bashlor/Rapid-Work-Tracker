import TaskAndDomainMultiDataView from '@/components/time-tracking/UserDataComponents/UserWorkDataComponents/TaskAndDomainMultiDataView'
import { BackendDomain, BackendTaskWithRelations } from '@/types'

interface UserWorkDataViewProps {
  domains: BackendDomain[]
  tasks: BackendTaskWithRelations[]
}

export function UserWorkDataView({ domains, tasks }: UserWorkDataViewProps) {
  return <TaskAndDomainMultiDataView domains={domains} tasks={tasks} />
}
