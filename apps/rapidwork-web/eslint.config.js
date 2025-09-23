import perfectionist from 'eslint-plugin-perfectionist'
import pluginQuery from '@tanstack/eslint-plugin-query'

import { configApp } from '@adonisjs/eslint-config'

export default configApp(
  {
    ignores: [
      'build/**/*',
      'dist/**/*', 
      'node_modules/**/*',
      '**/*.d.ts',
      '**/*.js', // Ignore les fichiers JS générés
      'public/**/*',
      'resources/views/**/*',
      'database/migrations/**/*', // Les migrations sont souvent générées
      'bin/**/*' // Fichiers de build
    ]
  },
  perfectionist.configs['recommended-natural'],
  pluginQuery.configs['flat/recommended']
)
