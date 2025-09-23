import { usePage } from '@inertiajs/react'
import { AlertTriangle, CheckCircle, Info, Play, Square, Timer, XCircle } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

interface Notification {
  message: string
  type: 'error' | 'info' | 'success' | 'warning'
}

interface PagePropsWithNotification {
  [key: string]: any
  flash?: {
    notification?: Notification
  }
}

export function useNotification() {
  const { props } = usePage<PagePropsWithNotification>()

  useEffect(() => {
    const notification = props.flash?.notification
    if (notification) {
      showNotification(notification.type, notification.message)
    }
  }, [props.flash?.notification])

  const showNotification = (type: Notification['type'], message: string, options?: any) => {
    const baseOptions = {
      duration: 4000,
      ...options,
    }

    switch (type) {
      case 'error':
        toast.error(message, {
          ...baseOptions,
          icon: <XCircle className="h-5 w-5" />,
        })
        break
      case 'info':
        toast.info(message, {
          ...baseOptions,
          icon: <Info className="h-5 w-5" />,
        })
        break
      case 'success':
        toast.success(message, {
          ...baseOptions,
          icon: <CheckCircle className="h-5 w-5" />,
        })
        break
      case 'warning':
        toast.warning(message, {
          ...baseOptions,
          icon: <AlertTriangle className="h-5 w-5" />,
        })
        break
      default:
        toast(message, baseOptions)
    }
  }

  // Fonctions spécialisées pour le contexte de l'app
  const showTimerNotification = (type: 'pause' | 'start' | 'stop', taskName: string) => {
    const messages = {
      pause: `Chronomètre mis en pause: ${taskName}`,
      start: `Chronomètre démarré pour: ${taskName}`,
      stop: `Chronomètre arrêté: ${taskName}`,
    }

    const icons = {
      pause: <Timer className="h-5 w-5 text-yellow-600" />,
      start: <Play className="h-5 w-5 text-green-600" />,
      stop: <Square className="h-5 w-5 text-red-600" />,
    }
    

    toast(messages[type], {
      description: type === 'stop' ? 'Tâche sauvegardée automatiquement' : undefined,
      duration: 3000,
      icon: icons[type],
    })
  }

  const showActionNotification = (action: string, success: boolean = true, details?: string) => {
    if (success) {
      toast.success(`${action} réalisé avec succès`, {
        description: details,
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />,
      })
    } else {
      toast.error(`Erreur lors de ${action}`, {
        description: details,
        duration: 5000,
        icon: <XCircle className="h-5 w-5" />,
      })
    }
  }

  return {
    error: (message: string, options?: any) => showNotification('error', message, options),
    info: (message: string, options?: any) => showNotification('info', message, options),
    showActionNotification,
    showNotification,
    showTimerNotification,
    // Raccourcis pour les types courants
    success: (message: string, options?: any) => showNotification('success', message, options),
    warning: (message: string, options?: any) => showNotification('warning', message, options),
  }
}
