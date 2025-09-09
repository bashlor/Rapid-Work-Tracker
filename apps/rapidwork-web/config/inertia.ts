import type { InferSharedProps } from '@adonisjs/inertia/types'

import { defineConfig } from '@adonisjs/inertia'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    errors: (ctx) => ctx.session?.flashMessages.get('errors'),
    notification: (ctx) => ctx.session?.flashMessages.get('notification') ?? {},
    queryParams: (ctx) => ctx.request.qs(),
    user: (ctx) =>
      ctx.inertia.always(() => {
        if (ctx?.auth?.user) {
          return ctx.auth.user
        }
        return null
      }),
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
