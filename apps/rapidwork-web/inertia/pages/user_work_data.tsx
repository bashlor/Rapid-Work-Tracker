import { Head } from '@inertiajs/react'

import { BackendDomain, BackendTaskWithRelations } from '@/types'
import { UserWorkDataView } from '@/views/UserWorkDataView'

export default function UserWorkDataPage({
  domains,
  tasks,
}: {
  domains: BackendDomain[]
  tasks: BackendTaskWithRelations[]
}) {
  return (
    <>
      <Head title="Données de Travail" />
      <UserWorkDataView domains={domains} tasks={tasks} />
    </>
  )
}
