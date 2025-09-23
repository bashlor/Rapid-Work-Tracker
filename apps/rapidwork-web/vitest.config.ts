import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './inertia'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*_spec.tsx'],
    setupFiles: ['./inertia/tests/utils/setup.ts'],
  },
})
