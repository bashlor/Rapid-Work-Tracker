import { Head } from '@inertiajs/react'

import type { ServerErrorPageProps } from '@/types/page_props'

export default function ServerError(props: ServerErrorPageProps) {
  const { errorCode, errorMessage } = props

  return (
    <>
      <Head title="Erreur Serveur" />
      <div className="container">
        <div className="title">Server Error {errorCode && `(${errorCode})`}</div>

        <span>{errorMessage || 'An unexpected error occurred.'}</span>
      </div>
    </>
  )
}
