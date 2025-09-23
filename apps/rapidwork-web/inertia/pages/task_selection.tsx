import { Head } from '@inertiajs/react'

import { TaskSelectionView } from '@/views/TaskSelectionView'

export default function TaskSelectionPage() {
  return (
    <>
      <Head title="Sélection de Tâche" />
      <TaskSelectionView />
    </>
  )
}
