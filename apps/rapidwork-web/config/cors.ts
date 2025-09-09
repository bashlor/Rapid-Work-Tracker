import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  credentials: true,
  enabled: env.get('CORS_ENABLED', true),
  exposeHeaders: [],
  headers: true,
  maxAge: 90,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  origin: true, // Allow all origins in development
})

export default corsConfig
