/* eslint-disable @tanstack/query/mutation-property-order */
import { type InertiaFormProps, useForm } from '@inertiajs/react'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import * as React from 'react'

import { useNotification } from './useNotification'

// Constraindre le type générique pour éviter la récursion infinie
export interface FormQueryHelpers<TData extends Record<string, any> = Record<string, any>> {
  cancel: () => void
  // Propriétés React Query
  canRetry: boolean
  clearErrors: (...fields: (keyof TData)[]) => void
  // Propriétés du form Inertia
  data: TData
  delete: (url: string, options?: VisitOptions) => void
  error: any
  errors: Partial<Record<keyof TData, string>>
  failureCount: number
  formattedErrors: Partial<Record<keyof TData, string>>
  get: (url: string, options?: VisitOptions) => void
  hasErrors: boolean
  isDirty: boolean
  isError: boolean
  isIdle: boolean
  isPending: boolean
  isSuccess: boolean
  patch: (url: string, options?: VisitOptions) => void

  // Méthodes HTTP avec retry
  post: (url: string, options?: VisitOptions) => void
  processing: boolean
  progress: any
  put: (url: string, options?: VisitOptions) => void
  recentlySuccessful: boolean
  reset: (...fields: (keyof TData)[]) => void

  resetAndClearErrors: (...fields: (keyof TData)[]) => void
  resetMutation: () => void
  retry: () => void
  setData: InertiaFormProps<TData>['setData']
  setDefaults: InertiaFormProps<TData>['setDefaults']
  setError: InertiaFormProps<TData>['setError']
  status: 'error' | 'idle' | 'pending' | 'success'
  submit: (
    method: 'delete' | 'get' | 'patch' | 'post' | 'put',
    url: string,
    options?: VisitOptions
  ) => void
  transform: (callback: (data: TData) => TData) => void
  wasSuccessful: boolean
}
export interface UseFormQueryOptions
  extends Omit<
    UseMutationOptions<any, any, { options?: VisitOptions; url: string }, any>,
    'mutationFn'
  > {
  /** Mapping des noms de champs vers leurs labels pour les messages d'erreur */
  fieldLabels?: Record<string, string>
  /** Messages de notification personnalisés */
  notifications?: {
    error?: string
    retry?: string
    success?: string
  }
  /** Callback appelé avant chaque tentative */
  onRetry?: (failureCount: number, error: any) => void
  /** Nombre de retry personnalisé (par défaut: 3) */
  retry?: ((failureCount: number, error: any) => boolean) | boolean | number
  /** Délai entre les retry (par défaut: exponentiel backoff) */
  retryDelay?: ((retryAttempt: number, error: any) => number) | number
  /** Affiche automatiquement les notifications de succès/erreur (par défaut: true) */
  showNotifications?: boolean
  /** Désactive le retry sur les erreurs de validation (par défaut: true) */
  skipRetryOnValidationErrors?: boolean
}

// Types simplifiés pour éviter les conflits d'import et les types trop profonds
type FormDataConvertible = boolean | Date | File | null | number | string | undefined

interface VisitOptions {
  data?: Record<string, FormDataConvertible | FormDataConvertible[]>
  errorBag?: string
  except?: string[]
  forceFormData?: boolean
  headers?: Record<string, string>
  method?: 'delete' | 'get' | 'patch' | 'post' | 'put'
  onBefore?: () => boolean | void
  onCancel?: () => void
  onError?: (errors: any) => void
  onFinish?: (visit: any) => void
  only?: string[]
  onProgress?: (progress: any) => void
  onStart?: (visit: any) => void
  onSuccess?: (page: any) => void
  preserveScroll?: boolean
  preserveState?: boolean
  queryStringArrayFormat?: 'brackets' | 'indices'
  replace?: boolean
}

/**
 * Hook custom qui combine useForm d'Inertia avec React Query pour gérer le retry
 *
 * @param initialData - Données initiales du formulaire
 * @param options - Options de configuration pour React Query
 * @returns Objet avec les mêmes propriétés que useForm + fonctionnalités de retry
 *
 * @example
 * ```tsx
 * const form = useFormQuery({
 *   name: '',
 *   email: '',
 *   password: ''
 * }, {
 *   retry: 3,
 *   retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
 *   onError: (error) => console.error('Erreur:', error),
 *   onSuccess: (data) => console.log('Succès:', data),
 *   onRetry: (failureCount, error) => console.log(`Tentative ${failureCount}`)
 * })
 *
 * const handleSubmit = (e: React.FormEvent) => {
 *   e.preventDefault()
 *   form.post('/register')
 * }
 * ```
 */
export function useFormQuery<TData extends Record<string, any> = Record<string, any>>(
  initialData: TData,
  options: UseFormQueryOptions = {}
): FormQueryHelpers<TData> {
  const {
    fieldLabels = {},
    notifications = {},
    onError,
    onMutate,
    onRetry,
    onSettled,
    onSuccess,
    retry = 3,
    retryDelay = (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    showNotifications = true,
    skipRetryOnValidationErrors = true,
    ...mutationOptions
  } = options

  // Hook pour les notifications
  const { showNotification } = useNotification()

  // Utilise le hook useForm d'Inertia avec un type plus explicite
  const form = useForm<TData>(initialData)

  // Référence pour stocker les derniers paramètres de soumission
  const lastSubmissionRef = useRef<null | {
    method: 'delete' | 'get' | 'patch' | 'post' | 'put'
    options?: VisitOptions
    url: string
  }>(null)

  // Mutation React Query pour gérer le retry

  const mutation = useMutation<any, any, { options?: VisitOptions; url: string }>({
    mutationFn: async ({ options: visitOptions, url }: { options?: VisitOptions; url: string }) => {
      return new Promise((resolve, reject) => {
        // Stocke les paramètres pour un retry éventuel
        lastSubmissionRef.current = {
          method: visitOptions?.method || 'post',
          options: visitOptions,
          url,
        }

        const enhancedOptions: VisitOptions = {
          ...visitOptions,
          onCancel: () => {
            reject(new Error('Request was cancelled'))
            visitOptions?.onCancel?.()
          },
          onError: (errors: any) => {
            reject(new Error(JSON.stringify(errors)))
            visitOptions?.onError?.(errors)
          },
          onFinish: (visit: any) => {
            visitOptions?.onFinish?.(visit)
          },
          onProgress: (progress: any) => {
            visitOptions?.onProgress?.(progress)
          },
          onStart: (visit: any) => {
            visitOptions?.onStart?.(visit)
          },
          onSuccess: (page: any) => {
            resolve(page)
            visitOptions?.onSuccess?.(page)
          },
        }

        // Utilise la méthode submit du form Inertia
        form.submit(visitOptions?.method || 'post', url, enhancedOptions)
      })
    },
    onError: (error, variables, context) => {
      // Affiche une notification d'erreur si activé
      if (showNotifications) {
        const errorMessage = notifications.error || 'Une erreur est survenue'
        showNotification('error', errorMessage)
      }

      if (onError) {
        onError(error, variables, context)
      }
    },
    onMutate: (variables) => {
      if (onMutate) {
        return onMutate(variables)
      }
    },
    onSettled: (data, error, variables, context) => {
      if (onSettled) {
        onSettled(data, error, variables, context)
      }
    },
    onSuccess: (data, variables, context) => {
      // Affiche une notification de succès si activé
      if (showNotifications && notifications.success) {
        showNotification('success', notifications.success)
      }

      if (onSuccess) {
        onSuccess(data, variables, context)
      }
    },
    retry: (failureCount, error) => {
      // Affiche une notification de retry si activé
      if (showNotifications && failureCount > 0) {
        const retryMessage = notifications.retry || `Nouvelle tentative ${failureCount}...`
        showNotification('info', retryMessage)
      }

      // Appelle le callback onRetry si fourni
      if (onRetry) {
        onRetry(failureCount, error)
      }

      // Ne pas retry sur les erreurs de validation si l'option est activée
      if (skipRetryOnValidationErrors && error instanceof Error) {
        try {
          const errorMessage = error.message
          // Si l'erreur contient des erreurs de validation JSON
          if (errorMessage.includes('{') && errorMessage.includes('}')) {
            const parsedError = JSON.parse(errorMessage)
            // Si c'est un objet d'erreurs de validation, ne pas retry
            if (typeof parsedError === 'object' && parsedError !== null) {
              return false
            }
          }
          // Vérifier les erreurs de validation par status code 422
          if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
            return false
          }
          // Aussi vérifier si l'erreur ressemble à une erreur de validation
          if (
            errorMessage.toLowerCase().includes('validation') ||
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('required')
          ) {
            return false
          }
        } catch (e) {
          // Si on ne peut pas parser l'erreur, continuer le retry pour les erreurs réseau
        }
      }

      // Gère le retry selon le type
      if (typeof retry === 'boolean') {
        return retry
      }
      if (typeof retry === 'number') {
        return failureCount < retry
      }
      if (typeof retry === 'function') {
        return retry(failureCount, error)
      }
      return false
    },
    retryDelay:
      typeof retryDelay === 'function'
        ? (attemptIndex, error) => retryDelay(attemptIndex, error)
        : retryDelay,
    ...mutationOptions,
  })

  // Fonctions pour les différentes méthodes HTTP
  const post = useCallback(
    (url: string, options?: VisitOptions) => {
      mutation.mutate({ options: { ...options, method: 'post' }, url })
    },
    [mutation.mutate]
  )

  const put = useCallback(
    (url: string, options?: VisitOptions) => {
      mutation.mutate({ options: { ...options, method: 'put' }, url })
    },
    [mutation.mutate]
  )

  const patch = useCallback(
    (url: string, options?: VisitOptions) => {
      mutation.mutate({ options: { ...options, method: 'patch' }, url })
    },
    [mutation.mutate]
  )

  const deleteMethod = useCallback(
    (url: string, options?: VisitOptions) => {
      mutation.mutate({ options: { ...options, method: 'delete' }, url })
    },
    [mutation.mutate]
  )

  const get = useCallback(
    (url: string, options?: VisitOptions) => {
      mutation.mutate({ options: { ...options, method: 'get' }, url })
    },
    [mutation.mutate]
  )

  const submit = useCallback(
    (method: 'delete' | 'get' | 'patch' | 'post' | 'put', url: string, options?: VisitOptions) => {
      mutation.mutate({ options: { ...options, method }, url })
    },
    [mutation.mutate]
  )

  // Fonction de retry manuel
  const retryMutation = useCallback(() => {
    if (lastSubmissionRef.current) {
      const { method, options, url } = lastSubmissionRef.current
      submit(method, url, options)
    }
  }, [submit])

  // Calcule les erreurs formatées avec les labels
  const formattedErrors = React.useMemo(() => {
    const formatted: Partial<Record<keyof TData, string>> = {}

    Object.entries(form.errors).forEach(([fieldName, errorMessage]) => {
      if (errorMessage && typeof errorMessage === 'string') {
        formatted[fieldName as keyof TData] = formatErrorMessage(
          fieldName,
          errorMessage,
          fieldLabels
        )
      }
    })

    return formatted
  }, [form.errors, fieldLabels])

  return {
    cancel: form.cancel,
    // Propriétés React Query
    canRetry: mutation.isError && !mutation.isPending,
    clearErrors: form.clearErrors as (...fields: (keyof TData)[]) => void,
    // Propriétés du form Inertia
    data: form.data,
    delete: deleteMethod,
    error: mutation.error,
    errors: form.errors as Partial<Record<keyof TData, string>>,
    failureCount: mutation.failureCount,
    formattedErrors,
    get,
    hasErrors: form.hasErrors,
    isDirty: form.isDirty,
    isError: mutation.isError,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    patch,

    // Méthodes HTTP avec retry
    post,
    processing: form.processing || mutation.isPending,
    progress: form.progress,
    put,
    recentlySuccessful: form.recentlySuccessful,
    reset: form.reset as (...fields: (keyof TData)[]) => void,

    resetAndClearErrors: form.resetAndClearErrors as (...fields: (keyof TData)[]) => void,
    resetMutation: mutation.reset,
    retry: retryMutation,
    setData: form.setData,
    setDefaults: form.setDefaults,
    setError: form.setError,
    status: mutation.status,
    submit,
    transform: form.transform,
    wasSuccessful: form.wasSuccessful,
  }
}

// Fonction utilitaire pour formatter les messages d'erreur
function formatErrorMessage(
  fieldName: string,
  message: string,
  fieldLabels?: Record<string, string>
): string {
  const label = fieldLabels?.[fieldName]
  if (label) {
    // Remplace le nom du champ par le label dans le message
    const regex = new RegExp(`\\b${fieldName}\\b`, 'gi')
    return message.replace(regex, label)
  }

  // Si pas de label personnalisé, convertit camelCase en format lisible
  const readableFieldName = fieldName
    .replace(/([A-Z])/g, ' $1') // Ajoute un espace avant les majuscules
    .replace(/^./, (str) => str.toUpperCase()) // Met la première lettre en majuscule
    .trim()

  const regex = new RegExp(`\\b${fieldName}\\b`, 'gi')
  return message.replace(regex, readableFieldName)
}

export default useFormQuery
