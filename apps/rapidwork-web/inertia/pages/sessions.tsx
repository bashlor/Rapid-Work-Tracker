import { Head } from '@inertiajs/react'

import { SessionsView } from '@/views/SessionsView'

export default function SessionsPage() {
  return (
    <>
      <Head title="Sessions de Travail" />
      <SessionsView />
    </>
  )
}
