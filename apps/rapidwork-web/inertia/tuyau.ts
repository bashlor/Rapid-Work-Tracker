import { createTuyau } from '@tuyau/client'
import { superjson } from '@tuyau/superjson/plugin'

import { api } from '../.adonisjs/api'
import { environment } from './config/environment'

export const tuyau = createTuyau({
  api,
  baseUrl: environment.API_BASE_URL,
  plugins: [superjson()],
})
