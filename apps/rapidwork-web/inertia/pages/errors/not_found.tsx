import { Head } from '@inertiajs/react'

import type { NotFoundPageProps } from '@/types/page_props'

export default function NotFound(props: NotFoundPageProps) {
  const { requestedPath } = props

  return (
    <>
      <Head title="Page non trouvée" />
      <div className="container">
        <div className="title">Page not found</div>
        {requestedPath && <span>The page "{requestedPath}" does not exist.</span>}
        {!requestedPath && <span>This page does not exist.</span>}
      </div>
    </>
  )
}
