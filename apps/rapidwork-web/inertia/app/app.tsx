/// <reference path="../../adonisrc.ts" />
/// <reference path="../../app/common/config/inertia.ts" />

import '../css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import Layout from '../components/layout/Layout'
import { TuyauProvider } from '@tuyau/inertia/react'
import { ReactQueryProvider } from '@/contexts/ReactQueryProvider'
import { Toaster } from '@/components/ui/toaster'
import { tuyau } from '@/tuyau'

const appName = import.meta.env.VITE_APP_NAME
const pageNameWithoutLayout = ['landing', 'login', 'register']

createInertiaApp({
  progress: { color: '#5468FF' },

  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    const page = resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'))
    // Apply layout to all pages except landing
    page.then((module: any) => {
      const lastSegment = name.split('/').pop()
      if (lastSegment && !pageNameWithoutLayout.includes(lastSegment)) {
        module.default.layout = (page: React.ReactNode) => <Layout>{page}</Layout>
      }
    })
    return page
  },

  setup({ el, App, props }) {
    createRoot(el).render(
      <>
        <ReactQueryProvider>
          <TuyauProvider client={tuyau}>
            <App {...props} />
            <Toaster />
          </TuyauProvider>
        </ReactQueryProvider>
      </>
    )
  },
})
