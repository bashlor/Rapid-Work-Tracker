/**
 * Environment configuration for the frontend application
 * This file centralizes the management of client-side environment variables
 */

interface Environment {
  API_BASE_URL: string
  APP_DEBUG: boolean
  APP_ENV: 'development' | 'production' | 'test'
}

/**
 * Function to retrieve an environment variable with a default value
 */
function getEnvVar(key: string, defaultValue: string): string {
  // In development mode with Vite, variables are prefixed with VITE_
  const viteKey = `VITE_${key}`

  // Try the Vite-prefixed variable first
  if (typeof window !== 'undefined' && (window as any).env) {
    return (window as any).env[key] || (window as any).env[viteKey] || defaultValue
  }

  // Fallback to import.meta.env for Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[viteKey] || import.meta.env[key] || defaultValue
  }

  // Fallback to process.env for compatibility
  if (typeof process !== 'undefined' && process.env) {
    return process.env[viteKey] || process.env[key] || defaultValue
  }

  return defaultValue
}

/**
 * Environment configuration
 */
export const environment: Environment = {
  // Base URL for the API - defaults to localhost:3333 in development
  API_BASE_URL: getEnvVar('API_BASE_URL', 'http://localhost:3333'),

  // Debug mode
  APP_DEBUG: getEnvVar('APP_DEBUG', 'true') === 'true',

  // Application environment
  APP_ENV: getEnvVar('NODE_ENV', 'development') as Environment['APP_ENV'],
}

/**
 * Utility functions to check the environment
 */
export const isDevelopment = () => environment.APP_ENV === 'development'
export const isProduction = () => environment.APP_ENV === 'production'
export const isTest = () => environment.APP_ENV === 'test'

export default environment
