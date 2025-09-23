/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createInertiaApp } from '@inertiajs/react'
import { TuyauProvider } from '@tuyau/inertia/react'
import i18n from 'i18next'
import Fetch from 'i18next-fetch-backend'
import ICU from 'i18next-icu'
import { createRoot } from 'react-dom/client'
import { I18nextProvider, initReactI18next } from 'react-i18next'

import { Toaster } from '@/components/ui/toaster'
import { ReactQueryProvider } from '@/contexts/ReactQueryProvider'
import { tuyau } from '@/tuyau'

import Layout from '../components/layout/Layout'

const appName = import.meta.env.VITE_APP_NAME || 'Rapid Work Tracker'
const pageNameWithoutLayout = ['landing', 'login', 'register']

i18n
  .use(Fetch)
  .use(ICU)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '../../resources/lang/{{lng}}/{{ns}}.json',
    },
    defaultNS: 'messages',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    lng: 'en',
    ns: ['messages'],
  })

createInertiaApp({
  progress: { color: '#5468FF' },

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

  setup({ App, el, props }) {
    createRoot(el).render(
      <>
        <I18nextProvider defaultNS={'messages'} i18n={i18n}>
          <ReactQueryProvider>
            <TuyauProvider client={tuyau}>
              <App {...props} />
              <Toaster />
            </TuyauProvider>
          </ReactQueryProvider>
        </I18nextProvider>
      </>
    )
  },

  title: (title) => `${title} - ${appName}`,
})
