import { Head } from '@inertiajs/react'
import type { ApiTask, ApiDomain } from '@/types/api'
import TaskAndDomainMultiDataView from '../components/time-tracking/UserWorkDataComponents/TaskAndDomainMultiDataView'

export default function UserWorkDataPage({ domains, tasks }: { domains: ApiDomain[]; tasks: ApiTask[] }) {
  return (
    <>
      <Head title="Données de Travail" />
      <TaskAndDomainMultiDataView domains={domains} tasks={tasks} />
    </>
  )
}
