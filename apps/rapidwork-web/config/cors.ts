import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const allowedOriginsEnv = env.get('CORS_ALLOWED_ORIGINS')
const allowedOrigins = allowedOriginsEnv
  ? String(allowedOriginsEnv)
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  : []

const isProd = env.get('NODE_ENV') === 'production'

const corsConfig = defineConfig({
  credentials: true,
  enabled: env.get('CORS_ENABLED', true),
  exposeHeaders: [],
  headers: true,
  maxAge: 90,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // In production, use explicit origins when provided; otherwise allow all (use with care)
  origin: isProd && allowedOrigins.length > 0 ? allowedOrigins : true,
})

export default corsConfig
