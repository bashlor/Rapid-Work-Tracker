import { getDirname } from '@adonisjs/core/helpers'
import inertia from '@adonisjs/inertia/client'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    VITE_API_BASE_URL: JSON.stringify(process.env.VITE_API_BASE_URL),
    VITE_APP_DEBUG: JSON.stringify(process.env.VITE_APP_DEBUG),
    VITE_NODE_ENV: JSON.stringify(process.env.VITE_NODE_ENV),
  },
  plugins: [
    inertia({ ssr: { enabled: false } }),
    react(),
    tailwindcss(),
    adonisjs({ entrypoints: ['inertia/app/app.tsx'], reload: ['resources/views/**/*.edge'] }),
  ],
  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      '@': path.resolve(getDirname(import.meta.url), 'inertia'),
      '@components': path.resolve(getDirname(import.meta.url), 'inertia/components'),
    },
  },
})
