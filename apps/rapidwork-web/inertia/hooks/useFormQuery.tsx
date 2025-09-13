import { useForm, type InertiaFormProps } from '@inertiajs/react'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { useRef, useCallback, useMemo } from 'react'
import * as React from 'react'
import { useNotification } from './useNotification'

// Simplified types to avoid import conflicts
type FormDataConvertible = string | number | boolean | File | Date | null | undefined
type FormDataType = Record<string, FormDataConvertible>

// Utility function to format error messages
function formatErrorMessage(
  fieldName: string,
  message: string,
  fieldLabels?: Record<string, string>
): string {
  const label = fieldLabels?.[fieldName]
  if (label) {
    // Replace field name with label in the message
    const regex = new RegExp(`\\b${fieldName}\\b`, 'gi')
    return message.replace(regex, label)
  }

  // If no custom label, convert camelCase to readable format
  const readableFieldName = fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
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
  /** Custom retry count (default: 3) */
  retry?: number | boolean | ((failureCount: number, error: any) => boolean)
  /** Delay between retries (default: exponential backoff) */
  retryDelay?: number | ((retryAttempt: number, error: any) => number)
  /** Callback called before each attempt */
  onRetry?: (failureCount: number, error: any) => void
  /** Disable retry on validation errors (default: true) */
  skipRetryOnValidationErrors?: boolean
  /** Automatically show success/error notifications (default: true) */
  showNotifications?: boolean
  /** Custom notification messages */
  notifications?: {
    success?: string
    error?: string
    retry?: string
  }
  /** Mapping of field names to their labels for error messages */
  fieldLabels?: Record<string, string>
  /** Automatically include X-Timezone header (default: true) */
  includeTimezone?: boolean
}

export interface FormQueryHelpers<TData extends FormDataType = FormDataType> {
  // Inertia form properties
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

  // HTTP methods with retry
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

  // React Query properties
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
 * Custom hook that combines Inertia's useForm with React Query to handle retry
 *
 * @param initialData - Initial form data
 * @param options - Configuration options for React Query
 * @returns Object with the same properties as useForm + retry functionalities
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
 *   onError: (error) => console.error('Error:', error),
 *   onSuccess: (data) => console.log('Success:', data),
 *   onRetry: (failureCount, error) => console.log(`Attempt ${failureCount}`)
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
    includeTimezone = true,
    onRetry,
    onError,
    onSuccess,
    onMutate,
    onSettled,
    ...mutationOptions
  } = options

  // Hook for notifications
  const { showNotification } = useNotification()

  // Use Inertia's useForm hook
  const form = useForm<TData>(initialData)

  // Reference to store last submission parameters
  const lastSubmissionRef = useRef<{
    method: 'get' | 'post' | 'put' | 'patch' | 'delete'
    url: string
    options?: VisitOptions
  } | null>(null)

  // Detect user's timezone
  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (error) {
      console.warn('Failed to detect timezone, fallback to UTC:', error)
      return 'UTC'
    }
  }, [])

  // Function to enhance options with timezone header
  const enhanceOptionsWithTimezone = useCallback((options?: VisitOptions): VisitOptions => {
    if (!includeTimezone) {
      return options || {}
    }

    return {
      ...options,
      headers: {
        'X-Timezone': userTimezone,
        ...options?.headers,
      },
    }
  }, [userTimezone, includeTimezone])

  // React Query mutation to handle retry
  const mutation = useMutation<any, any, { url: string; options?: VisitOptions }>({
    mutationFn: async ({ url, options: visitOptions }: { url: string; options?: VisitOptions }) => {
      return new Promise((resolve, reject) => {
        // Store parameters for potential retry
        lastSubmissionRef.current = {
          method: visitOptions?.method || 'post',
          url,
          options: visitOptions,
        }

        // Enhance options with timezone header
        const enhancedVisitOptions = enhanceOptionsWithTimezone(visitOptions)

        const enhancedOptions: VisitOptions = {
          ...enhancedVisitOptions,
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

        // Use Inertia form's submit method
        form.submit(visitOptions?.method || 'post', url, enhancedOptions)
      })
    },
    retry: (failureCount, error) => {
      // Show retry notification if enabled
      if (showNotifications && failureCount > 0) {
        const retryMessage = notifications.retry || `Retry attempt ${failureCount}...`
        showNotification('info', retryMessage)
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(failureCount, error)
      }

      // Don't retry on validation errors if option is enabled
      if (skipRetryOnValidationErrors && error instanceof Error) {
        try {
          const errorMessage = error.message
          // If error contains validation errors JSON
          if (errorMessage.includes('{') && errorMessage.includes('}')) {
            const parsedError = JSON.parse(errorMessage)
            // If it's a validation errors object, don't retry
            if (typeof parsedError === 'object' && parsedError !== null) {
              return false
            }
          }
          // Check for validation errors by status code 422
          if (errorMessage.includes('422') || errorMessage.includes('Unprocessable Entity')) {
            return false
          }
          // Also check if error looks like a validation error
          if (
            errorMessage.toLowerCase().includes('validation') ||
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('required')
          ) {
            return false
          }
        } catch (e) {
          // If we can't parse the error, continue retry for network errors
        }
      }

      // Handle retry based on type
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
      // Show error notification if enabled
      if (showNotifications) {
        const errorMessage = notifications.error || 'An error occurred'
        showNotification('error', errorMessage)
      }

      if (onError) {
        onError(error, variables, context)
      }
    },
    onSuccess: (data, variables, context) => {
      // Show success notification if enabled
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

  // Functions for different HTTP methods
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

  // Manual retry function
  const retryMutation = useCallback(() => {
    if (lastSubmissionRef.current) {
      const { method, url, options } = lastSubmissionRef.current
      submit(method, url, options)
    }
  }, [submit])

  // Calculate formatted errors with labels
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
    // Inertia form properties
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

    // HTTP methods with retry
    post,
    put,
    patch,
    delete: deleteMethod,
    get,
    submit,

    // React Query properties
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
