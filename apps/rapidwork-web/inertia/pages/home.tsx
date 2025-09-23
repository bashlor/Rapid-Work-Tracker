import { Head } from '@inertiajs/react'

import { HomeView } from '@/views/HomeView'

import type { HomePageProps } from '../types/page_props'

export default function Home(props: HomePageProps) {
  const { flash, user } = props

  return (
    <>
      <Head title="Tableau de bord" />
      <HomeView flash={flash} user={user} />
    </>
  )
}
