import { router } from '@inertiajs/react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNotification } from './useNotification'
import { tuyau } from '@/tuyau'

// Utilisation des types générés par Tuyau
type LoginCredentials = Parameters<typeof tuyau.auth.login.$post>[0]
type LoginResponse = Awaited<ReturnType<typeof tuyau.auth.login.$post>>
type LogoutResponse = Awaited<ReturnType<typeof tuyau.auth.logout.$post>>

// Type pour les erreurs de validation
interface ValidationError {
  errors?: {
    [key: string]: string[]
  }
  message: string
}

export function useAuth() {
  const { showNotification } = useNotification()
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await tuyau.auth.login.$post(credentials)
    },
    onError: (error: any) => {
      // Handle validation errors
      if (error.status === 422 || error.response?.status === 422) {
        const errorData = error.body || (error.response?.data as ValidationError)
        setValidationErrors(errorData.errors || {})
        showNotification('error', errorData.message || 'Erreur de validation')
      } else {
        showNotification('error', 'Une erreur est survenue lors de la connexion')
        setValidationErrors({})
      }
    },
    onSuccess: (data: LoginResponse) => {
      setValidationErrors({})
      showNotification('success', data.message)

      // Redirect using Inertia
      if ('redirectTo' in data && data.redirectTo) {
        router.visit(data.redirectTo)
      }
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await tuyau.auth.logout.$post()
    },
    onError: (error: any) => {
      showNotification('error', 'Erreur lors de la déconnexion')
    },
    onSuccess: (data: LogoutResponse) => {
      showNotification('success', 'Déconnexion réussie')
      router.visit('/login')
    },
  })

  return {
    clearValidationErrors: () => setValidationErrors({}),
    isLoading: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    validationErrors,
  }
}
