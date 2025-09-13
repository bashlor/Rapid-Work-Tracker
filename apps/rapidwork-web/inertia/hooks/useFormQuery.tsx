import { useForm, type InertiaFormProps } from '@inertiajs/react'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { useRef, useCallback } from 'react'
import * as React from 'react'
import { useNotification } from './useNotification'

// Types simplifiés pour éviter les conflits d'import
type FormDataConvertible = string | number | boolean | File | Date | null | undefined
type FormDataType = Record<string, FormDataConvertible>

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

interface VisitOptions {
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete'
  data?: Record<string, FormDataConvertible>
  replace?: boolean
  preserveScroll?: boolean
  preserveState?: boolean
  only?: string[]
  except?: string[]
  headers?: Record<string, string>
  errorBag?: string
  forceFormData?: boolean
  queryStringArrayFormat?: 'brackets' | 'indices'
  onBefore?: () => void | boolean
  onStart?: (visit: any) => void
  onProgress?: (progress: any) => void
  onFinish?: (visit: any) => void
  onCancel?: () => void
  onSuccess?: (page: any) => void
  onError?: (errors: any) => void
}

export interface UseFormQueryOptions
  extends Omit<
    UseMutationOptions<any, any, { url: string; options?: VisitOptions }, any>,
    'mutationFn'
  > {
  /** Nombre de retry personnalisé (par défaut: 3) */
  retry?: number | boolean | ((failureCount: number, error: any) => boolean)
  /** Délai entre les retry (par défaut: exponentiel backoff) */
  retryDelay?: number | ((retryAttempt: number, error: any) => number)
  /** Callback appelé avant chaque tentative */
  onRetry?: (failureCount: number, error: any) => void
  /** Désactive le retry sur les erreurs de validation (par défaut: true) */
  skipRetryOnValidationErrors?: boolean
  /** Affiche automatiquement les notifications de succès/erreur (par défaut: true) */
  showNotifications?: boolean
  /** Messages de notification personnalisés */
  notifications?: {
    success?: string
    error?: string
    retry?: string
  }
  /** Mapping des noms de champs vers leurs labels pour les messages d'erreur */
  fieldLabels?: Record<string, string>
}

export interface FormQueryHelpers<TData extends FormDataType = FormDataType> {
  // Propriétés du form Inertia
  data: TData
  isDirty: boolean
  errors: Partial<Record<keyof TData, string>>
  formattedErrors: Partial<Record<keyof TData, string>>
  hasErrors: boolean
  processing: boolean
  progress: any
  wasSuccessful: boolean
  recentlySuccessful: boolean
  setData: InertiaFormProps<TData>['setData']
  transform: (callback: (data: TData) => TData) => void
  setDefaults: InertiaFormProps<TData>['setDefaults']
  reset: (...fields: (keyof TData)[]) => void
  clearErrors: (...fields: (keyof TData)[]) => void
  resetAndClearErrors: (...fields: (keyof TData)[]) => void
  setError: InertiaFormProps<TData>['setError']
  cancel: () => void

  // Méthodes HTTP avec retry
  post: (url: string, options?: VisitOptions) => void
  put: (url: string, options?: VisitOptions) => void
  patch: (url: string, options?: VisitOptions) => void
  delete: (url: string, options?: VisitOptions) => void
  get: (url: string, options?: VisitOptions) => void
  submit: (
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    options?: VisitOptions
  ) => void

  // Propriétés React Query
  canRetry: boolean
  retry: () => void
  failureCount: number
  error: any
  status: 'idle' | 'pending' | 'error' | 'success'
  isIdle: boolean
  isPending: boolean
  isError: boolean
  isSuccess: boolean
  resetMutation: () => void
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
export function useFormQuery<TData extends FormDataType = FormDataType>(
  initialData: TData,
  options: UseFormQueryOptions = {}
): FormQueryHelpers<TData> {
  const {
    retry = 3,
    retryDelay = (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    skipRetryOnValidationErrors = true,
    showNotifications = true,
    notifications = {},
    fieldLabels = {},
    onRetry,
    onError,
    onSuccess,
    onMutate,
    onSettled,
    ...mutationOptions
  } = options

  // Hook pour les notifications
  const { showNotification } = useNotification()

  // Utilise le hook useForm d'Inertia
  const form = useForm<TData>(initialData)

  // Référence pour stocker les derniers paramètres de soumission
  const lastSubmissionRef = useRef<{
    method: 'get' | 'post' | 'put' | 'patch' | 'delete'
    url: string
    options?: VisitOptions
  } | null>(null)

  // Mutation React Query pour gérer le retry
  const mutation = useMutation<any, any, { url: string; options?: VisitOptions }>({
    mutationFn: async ({ url, options: visitOptions }: { url: string; options?: VisitOptions }) => {
      return new Promise((resolve, reject) => {
        // Stocke les paramètres pour un retry éventuel
        lastSubmissionRef.current = {
          method: visitOptions?.method || 'post',
          url,
          options: visitOptions,
        }

        const enhancedOptions: VisitOptions = {
          ...visitOptions,
          onSuccess: (page: any) => {
            resolve(page)
            visitOptions?.onSuccess?.(page)
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
          onCancel: () => {
            reject(new Error('Request was cancelled'))
            visitOptions?.onCancel?.()
          },
        }

        // Utilise la méthode submit du form Inertia
        form.submit(visitOptions?.method || 'post', url, enhancedOptions)
      })
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
    onMutate: (variables) => {
      if (onMutate) {
        return onMutate(variables)
      }
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
    onSuccess: (data, variables, context) => {
      // Affiche une notification de succès si activé
      if (showNotifications && notifications.success) {
        showNotification('success', notifications.success)
      }

      if (onSuccess) {
        onSuccess(data, variables, context)
      }
    },
    onSettled: (data, error, variables, context) => {
      if (onSettled) {
        onSettled(data, error, variables, context)
      }
    },
    ...mutationOptions,
  })

  // Fonctions pour les différentes méthodes HTTP
  const post = useCallback(
    (url: string, options?: VisitOptions) => {
      mutation.mutate({ url, options: { ...options, method: 'post' } })
    },
    [mutation]
  )

  const put = useCallback(
    (url: string, options?: VisitOptions) => {
      mutation.mutate({ url, options: { ...options, method: 'put' } })
    },
    [mutation]
  )

  const patch = useCallback(
    (url: string, options?: VisitOptions) => {
      mutation.mutate({ url, options: { ...options, method: 'patch' } })
    },
    [mutation]
  )

  const deleteMethod = useCallback(
    (url: string, options?: VisitOptions) => {
      mutation.mutate({ url, options: { ...options, method: 'delete' } })
    },
    [mutation]
  )

  const get = useCallback(
    (url: string, options?: VisitOptions) => {
      mutation.mutate({ url, options: { ...options, method: 'get' } })
    },
    [mutation]
  )

  const submit = useCallback(
    (method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, options?: VisitOptions) => {
      mutation.mutate({ url, options: { ...options, method } })
    },
    [mutation]
  )

  // Fonction de retry manuel
  const retryMutation = useCallback(() => {
    if (lastSubmissionRef.current) {
      const { method, url, options } = lastSubmissionRef.current
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
    // Propriétés du form Inertia
    data: form.data,
    isDirty: form.isDirty,
    processing: form.processing || mutation.isPending,
    progress: form.progress,
    errors: form.errors as Partial<Record<keyof TData, string>>,
    formattedErrors,
    hasErrors: form.hasErrors,
    wasSuccessful: form.wasSuccessful,
    recentlySuccessful: form.recentlySuccessful,
    setData: form.setData,
    transform: form.transform as (callback: (data: TData) => TData) => void,
    setDefaults: form.setDefaults,
    clearErrors: form.clearErrors as (...fields: (keyof TData)[]) => void,
    reset: form.reset as (...fields: (keyof TData)[]) => void,
    resetAndClearErrors: form.resetAndClearErrors as (...fields: (keyof TData)[]) => void,
    setError: form.setError,
    cancel: form.cancel,

    // Méthodes HTTP avec retry
    post,
    put,
    patch,
    delete: deleteMethod,
    get,
    submit,

    // Propriétés React Query
    canRetry: mutation.isError && !mutation.isPending,
    retry: retryMutation,
    failureCount: mutation.failureCount,
    error: mutation.error,
    status: mutation.status,
    isIdle: mutation.isIdle,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    resetMutation: mutation.reset,
  }
}

export default useFormQuery
