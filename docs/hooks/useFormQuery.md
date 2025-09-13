# useFormQuery Hook

Un hook custom qui combine le hook `useForm` d'Inertia avec React Query pour gérer le retry automatique des requêtes de formulaire.

## Installation

Le hook est déjà inclus dans le projet dans `/inertia/hooks/useFormQuery.tsx`.

## Utilisation de base

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
        {form.processing ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  )
}
```

## Configuration avancée

```tsx
const form = useFormQuery(
  {
    name: '',
    email: '',
  },
  {
    // Nombre de retry (défaut: 3)
    retry: 5,

    // Délai entre les retry (défaut: exponential backoff)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Désactive le retry sur les erreurs de validation (défaut: true)
    skipRetryOnValidationErrors: true,

    // Affichage automatique des notifications (défaut: true)
    showNotifications: true,

    // Messages de notification personnalisés
    notifications: {
      success: 'Données sauvegardées avec succès!',
      error: 'Erreur lors de la sauvegarde',
      retry: 'Nouvelle tentative en cours...',
    },

    // Callbacks
    onRetry: (failureCount, error) => {
      console.log(`Tentative ${failureCount}`)
    },
    onError: (error) => {
      console.error('Erreur finale:', error)
    },
    onSuccess: (data) => {
      console.log('Succès:', data)
    },
  }
)
```

## Gestion intelligente des erreurs

Le hook distingue automatiquement entre :

### 🔄 Erreurs réseau/serveur (avec retry)

- Erreurs de connexion (timeout, réseau indisponible)
- Erreurs serveur 5xx
- Erreurs temporaires

### 🚫 Erreurs de validation (sans retry)

- Erreurs de validation des champs
- Email déjà existant
- Mot de passe trop faible
- Données invalides

```tsx
// Exemple avec gestion des différents types d'erreur
const form = useFormQuery(initialData, {
  onRetry: (failureCount, error) => {
    // Appelé uniquement pour les erreurs réseau
    toast.info(`Nouvelle tentative ${failureCount}...`)
  },
  onError: (error) => {
    // Appelé pour toutes les erreurs finales
    if (form.canRetry) {
      toast.error('Problème de connexion')
    } else {
      toast.error('Veuillez corriger les erreurs du formulaire')
    }
  },
})

// Interface utilisateur adaptée
{
  form.isError && form.canRetry && (
    <Alert variant="destructive">
      <AlertDescription>
        Erreur de connexion
        <Button onClick={form.retry}>Réessayer</Button>
      </AlertDescription>
    </Alert>
  )
}

{
  form.isError && !form.canRetry && (
    <Alert variant="destructive">
      <AlertDescription>Veuillez corriger les erreurs dans le formulaire</AlertDescription>
    </Alert>
  )
}
```

## API

### Propriétés héritées d'Inertia useForm

- `data` - Les données du formulaire
- `setData(key, value)` - Mettre à jour une propriété
- `errors` - Erreurs de validation du serveur
- `hasErrors` - Booléen indiquant s'il y a des erreurs
- `processing` - Indique si une requête est en cours
- `progress` - Progression de l'upload (si applicable)
- `wasSuccessful` - Indique si la dernière requête a réussi
- `recentlySuccessful` - Indique si une requête a récemment réussi
- `transform(callback)` - Transforme les données avant envoi
- `reset(...fields)` - Remet à zéro des champs spécifiques
- `clearErrors(...fields)` - Efface les erreurs de validation
- `cancel()` - Annule la requête en cours

### Méthodes HTTP avec retry

- `post(url, options)` - Requête POST avec retry
- `put(url, options)` - Requête PUT avec retry
- `patch(url, options)` - Requête PATCH avec retry
- `delete(url, options)` - Requête DELETE avec retry
- `get(url, options)` - Requête GET avec retry
- `submit(method, url, options)` - Requête générique avec retry

### Propriétés React Query

- `canRetry` - Indique si un retry manuel est possible
- `retry()` - Fonction pour retry manuellement
- `failureCount` - Nombre de tentatives échouées
- `error` - Dernière erreur rencontrée
- `status` - État actuel: 'idle' | 'pending' | 'error' | 'success'
- `isIdle` - Booléen: état idle
- `isPending` - Booléen: requête en cours
- `isError` - Booléen: en erreur
- `isSuccess` - Booléen: succès
- `resetMutation()` - Remet à zéro l'état de la mutation

## Options de configuration

```tsx
interface UseFormQueryOptions {
  // Nombre de retry ou fonction custom
  retry?: number | boolean | ((failureCount: number, error: any) => boolean)

  // Délai entre les retry
  retryDelay?: number | ((retryAttempt: number, error: any) => number)

  // Callback appelé avant chaque tentative
  onRetry?: (failureCount: number, error: any) => void

  // Désactive le retry sur les erreurs de validation (défaut: true)
  skipRetryOnValidationErrors?: boolean

  // Affiche automatiquement les notifications (défaut: true)
  showNotifications?: boolean

  // Messages de notification personnalisés
  notifications?: {
    success?: string // Message de succès
    error?: string // Message d'erreur
    retry?: string // Message lors des retry
  }

  // Autres options React Query (onError, onSuccess, etc.)
  onError?: (error: any, variables: any, context: any) => void
  onSuccess?: (data: any, variables: any, context: any) => void
  onMutate?: (variables: any) => any
  onSettled?: (data: any, error: any, variables: any, context: any) => void
}
```

## Exemples d'utilisation

### Retry avec gestion d'erreur

```tsx
const form = useFormQuery(initialData, {
  retry: 3,
  onRetry: (failureCount, error) => {
    console.log(`Tentative ${failureCount} après erreur:`, error)
  },
  onError: (error) => {
    // Cette fonction n'est appelée qu'après épuisement des retry
    toast.error('Impossible de sauvegarder après plusieurs tentatives')
  },
})

// Interface utilisateur avec retry manuel
{
  form.isError && form.canRetry && (
    <button onClick={form.retry}>
      Réessayer ({form.failureCount} tentative{form.failureCount > 1 ? 's' : ''})
    </button>
  )
}
```

### Retry conditionnel

```tsx
const form = useFormQuery(initialData, {
  retry: (failureCount, error) => {
    // Ne retry que sur les erreurs réseau
    if (error.message.includes('network')) {
      return failureCount < 5
    }
    return false
  },
  retryDelay: (attemptIndex) => {
    // Délai linéaire pour les erreurs réseau
    return 2000 * attemptIndex
  },
})
```

### Intégration avec des notifications

```tsx
// Notifications automatiques (recommandé)
const form = useFormQuery(initialData, {
  showNotifications: true,
  notifications: {
    success: 'Données sauvegardées!',
    error: 'Erreur lors de la sauvegarde',
    retry: 'Nouvelle tentative...',
  },
})

// Ou gestion manuelle des notifications
const form = useFormQuery(initialData, {
  showNotifications: false, // Désactive les notifications automatiques
  onRetry: (failureCount) => {
    toast.info(`Nouvelle tentative ${failureCount}...`)
  },
  onError: () => {
    toast.error('Échec de la sauvegarde')
  },
  onSuccess: () => {
    toast.success('Sauvegardé avec succès!')
  },
})
```

## Avantages

1. **Retry automatique** : Gère automatiquement les erreurs temporaires
2. **API familière** : Même interface que `useForm` d'Inertia
3. **Contrôle granulaire** : Configuration flexible du retry
4. **État riche** : Accès aux informations de status React Query
5. **Retry manuel** : Possibilité de retry depuis l'interface
6. **Notifications intégrées** : Affichage automatique des messages de succès/erreur
7. **Gestion d'erreurs avancée** : Distinction entre erreurs de validation et erreurs réseau
8. **TypeScript** : Support complet des types

## Migration depuis useForm

Il suffit de remplacer `useForm` par `useFormQuery` :

```tsx
// Avant
import { useForm } from '@inertiajs/react'
const form = useForm(initialData)

// Après
import { useFormQuery } from '@/hooks/useFormQuery'
const form = useFormQuery(initialData)
```

Toutes les propriétés existantes continuent de fonctionner, avec en plus les fonctionnalités de retry.
