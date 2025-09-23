import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  /**
   * Disable browsers from sniffing the content type of a
   * response and always rely on the "content-type" header.
   */
  contentTypeSniffing: {
    enabled: true,
  },

  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more
   */
  csp: {
    directives: {},
    enabled: false,
    reportOnly: false,
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more
   */
  csrf: {
    enabled: true,
    enableXsrfCookie: true,
    exceptRoutes: (ctx) => ctx.request.url().startsWith('/api'),
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Force browser to always use HTTPS
   */
  hsts: {
    enabled: true,
    maxAge: '180 days',
  },

  /**
   * Control how your website should be embedded inside
   * iFrames
   */
  xFrame: {
    action: 'DENY',
    enabled: true,
  },
})

export default shieldConfig
