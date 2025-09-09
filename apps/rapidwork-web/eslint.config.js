import perfectionist from 'eslint-plugin-perfectionist'
import pluginQuery from '@tanstack/eslint-plugin-query'

import { configApp } from '@adonisjs/eslint-config'
export default configApp(
  perfectionist.configs['recommended-natural'],
  pluginQuery.configs['flat/recommended']
)
