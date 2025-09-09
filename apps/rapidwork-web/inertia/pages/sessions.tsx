import { Head } from '@inertiajs/react'
import DetailedEntry from '../components/time-tracking/DetailedEntry'
import type { SessionsPageProps } from '../types/page_props'

export default function SessionsPage(props: SessionsPageProps) {
  
  return (
    <>
      <Head title="Sessions de Travail" />
      <DetailedEntry />
    </>
  )
}
