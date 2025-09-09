import { Head } from '@inertiajs/react'
import DetailedEntry from '../components/time-tracking/DetailedEntry'
import type { AddWorkSessionPageProps } from '../types/page_props'

export default function AddWorkSessionPage(_props: AddWorkSessionPageProps) {
  return (
    <>
      <Head title="Ajouter Session" />
      <DetailedEntry />
    </>
  )
}
