import { Head } from '@inertiajs/react'
import TaskAndDomainMultiDataView from '../components/time-tracking/UserWorkDataComponents/TaskAndDomainMultiDataView'
import { BackendDomain, BackendTaskWithRelations } from '@/types';

export default function UserWorkDataPage({ domains, tasks }: { domains: BackendDomain[]; tasks: BackendTaskWithRelations[] }) {
  return (
    <>
      <Head title="Données de Travail" />
      <TaskAndDomainMultiDataView domains={domains} tasks={tasks} />
    </>
  )
}
