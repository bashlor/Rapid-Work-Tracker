import { Head } from '@inertiajs/react'

import { ChronometerView } from '@/views/ChronometerView'

export default function TimerViewPage() {
  return (
    <>
      <Head title="Chronomètre" />
      <ChronometerView />
    </>
  )
}
