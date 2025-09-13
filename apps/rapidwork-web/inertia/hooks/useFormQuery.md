# useFormQuery Hook

A custom hook that combines Inertia's `useForm` hook with React Query to handle automatic retry for form requests.

## Installation

The hook is already included in the project at `/inertia/hooks/useFormQuery.tsx`.

## Basic Usage

```tsx
import { useFormQuery } from '@/hooks/useFormQuery'

function MyForm() {
  const form = useFormQuery({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post('/register')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
      {form.errors.name && <span>{form.errors.name}</span>}

      <button type="submit" disabled={form.processing}>
        {form.processing ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

## Advanced Configuration

```tsx
const form = useFormQuery(
  {
    name: '',
    email: '',
  },
  {
    // Number of retries (default: 3)
    retry: 5,

    // Delay between retries (default: exponential backoff)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Disable retry on validation errors (default: true)
    skipRetryOnValidationErrors: true,

    // Automatic notification display (default: true)
    showNotifications: true,

    // Custom notification messages
    notifications: {
      success: 'Data saved successfully!',
      error: 'Error while saving',
      retry: 'Retrying...',
    },

    // Automatically include X-Timezone header (default: true)
    includeTimezone: true,

    // Callbacks
    onRetry: (failureCount, error) => {
      console.log(`Attempt ${failureCount}`)
    },
    onError: (error) => {
      console.error('Final error:', error)
    },
    onSuccess: (data) => {
      console.log('Success:', data)
    },
  }
)
```

## Intelligent Error Handling

The hook automatically distinguishes between:

### 🔄 Network/Server Errors (with retry)

- Connection errors (timeout, network unavailable)
- Server errors 5xx
- Temporary errors

### 🚫 Validation Errors (without retry)

- Field validation errors
- Email already exists
- Password too weak
- Invalid data

```tsx
// Example with different error type handling
const form = useFormQuery(initialData, {
  onRetry: (failureCount, error) => {
    // Called only for network errors
    toast.info(`Retry attempt ${failureCount}...`)
  },
  onError: (error) => {
    // Called for all final errors
    if (form.canRetry) {
      toast.error('Connection problem')
    } else {
      toast.error('Please fix form errors')
    }
  },
})

// Adapted user interface
{
  form.isError && form.canRetry && (
    <Alert variant="destructive">
      <AlertDescription>
        Connection error
        <Button onClick={form.retry}>Retry</Button>
      </AlertDescription>
    </Alert>
  )
}

{
  form.isError && !form.canRetry && (
    <Alert variant="destructive">
      <AlertDescription>Please fix errors in the form</AlertDescription>
    </Alert>
  )
}
```

## API

### Properties inherited from Inertia useForm

- `data` - Form data
- `setData(key, value)` - Update a property
- `errors` - Server validation errors
- `formattedErrors` - Errors with custom field labels applied
- `hasErrors` - Boolean indicating if there are errors
- `processing` - Indicates if a request is in progress
- `progress` - Upload progress (if applicable)
- `wasSuccessful` - Indicates if the last request was successful
- `recentlySuccessful` - Indicates if a request was recently successful
- `transform(callback)` - Transform data before sending
- `reset(...fields)` - Reset specific fields
- `clearErrors(...fields)` - Clear validation errors
- `cancel()` - Cancel current request

### HTTP methods with retry

- `post(url, options)` - POST request with retry
- `put(url, options)` - PUT request with retry
- `patch(url, options)` - PATCH request with retry
- `delete(url, options)` - DELETE request with retry
- `get(url, options)` - GET request with retry
- `submit(method, url, options)` - Generic request with retry

### React Query properties

- `canRetry` - Indicates if manual retry is possible
- `retry()` - Function to retry manually
- `failureCount` - Number of failed attempts
- `error` - Last encountered error
- `status` - Current state: 'idle' | 'pending' | 'error' | 'success'
- `isIdle` - Boolean: idle state
- `isPending` - Boolean: request in progress
- `isError` - Boolean: in error state
- `isSuccess` - Boolean: success state
- `resetMutation()` - Reset mutation state

## Configuration Options

```tsx
interface UseFormQueryOptions {
  // Number of retries or custom function
  retry?: number | boolean | ((failureCount: number, error: any) => boolean)

  // Delay between retries
  retryDelay?: number | ((retryAttempt: number, error: any) => number)

  // Callback called before each attempt
  onRetry?: (failureCount: number, error: any) => void

  // Disable retry on validation errors (default: true)
  skipRetryOnValidationErrors?: boolean

  // Automatically show notifications (default: true)
  showNotifications?: boolean

  // Custom notification messages
  notifications?: {
    success?: string // Success message
    error?: string // Error message
    retry?: string // Retry message
  }

  // Mapping of field names to their labels for error messages
  fieldLabels?: Record<string, string>

  // Automatically include X-Timezone header (default: true)
  includeTimezone?: boolean

  // Other React Query options (onError, onSuccess, etc.)
  onError?: (error: any, variables: any, context: any) => void
  onSuccess?: (data: any, variables: any, context: any) => void
  onMutate?: (variables: any) => any
  onSettled?: (data: any, error: any, variables: any, context: any) => void
}
```

## Usage Examples

### Retry with error handling

```tsx
const form = useFormQuery(initialData, {
  retry: 3,
  onRetry: (failureCount, error) => {
    console.log(`Attempt ${failureCount} after error:`, error)
  },
  onError: (error) => {
    // This function is only called after retries are exhausted
    toast.error('Unable to save after multiple attempts')
  },
})

// User interface with manual retry
{
  form.isError && form.canRetry && (
    <button onClick={form.retry}>
      Retry ({form.failureCount} attempt{form.failureCount > 1 ? 's' : ''})
    </button>
  )
}
```

### Conditional retry

```tsx
const form = useFormQuery(initialData, {
  retry: (failureCount, error) => {
    // Only retry on network errors
    if (error.message.includes('network')) {
      return failureCount < 5
    }
    return false
  },
  retryDelay: (attemptIndex) => {
    // Linear delay for network errors
    return 2000 * attemptIndex
  },
})
```

### Integration with notifications

```tsx
// Automatic notifications (recommended)
const form = useFormQuery(initialData, {
  showNotifications: true,
  notifications: {
    success: 'Data saved!',
    error: 'Error while saving',
    retry: 'Retrying...',
  },
})

// Or manual notification handling
const form = useFormQuery(initialData, {
  showNotifications: false, // Disable automatic notifications
  onRetry: (failureCount) => {
    toast.info(`Retry attempt ${failureCount}...`)
  },
  onError: () => {
    toast.error('Save failed')
  },
  onSuccess: () => {
    toast.success('Saved successfully!')
  },
})
```

### Custom field labels for error messages

```tsx
const form = useFormQuery(initialData, {
  fieldLabels: {
    firstName: 'First Name',
    lastName: 'Last Name',
    emailAddress: 'Email Address',
  },
})

// Now form.formattedErrors will use the custom labels
// Instead of "firstName is required" you'll get "First Name is required"
```

## Advantages

1. **Automatic retry**: Handles temporary errors automatically
2. **Familiar API**: Same interface as Inertia's `useForm`
3. **Granular control**: Flexible retry configuration
4. **Rich state**: Access to React Query status information
5. **Manual retry**: Ability to retry from the interface
6. **Integrated notifications**: Automatic display of success/error messages
7. **Advanced error handling**: Distinction between validation and network errors
8. **TypeScript**: Full type support
9. **Automatic timezone**: Sends user's timezone in X-Timezone header
10. **Custom field labels**: Better error message formatting

## Migration from useForm

Simply replace `useForm` with `useFormQuery`:

```tsx
// Before
import { useForm } from '@inertiajs/react'
const form = useForm(initialData)

// After
import { useFormQuery } from '@/hooks/useFormQuery'
const form = useFormQuery(initialData)
```

All existing properties continue to work, with additional retry functionalities.
