import { usePage } from '@inertiajs/react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertTriangle, Info, Timer, Play, Square } from 'lucide-react'

interface Notification {
  message: string
  type: 'error' | 'info' | 'success' | 'warning'
}

interface PagePropsWithNotification {
  flash?: {
    notification?: Notification
  }
  [key: string]: any
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
      case 'info':
        toast.info(message, {
          ...baseOptions,
          icon: <Info className="h-5 w-5" />,
        })
        break
      default:
        toast(message, baseOptions)
    }
  }

  // Fonctions spécialisées pour le contexte de l'app
  const showTimerNotification = (type: 'start' | 'pause' | 'stop', taskName: string) => {
    const messages = {
      start: `Chronomètre démarré pour: ${taskName}`,
      pause: `Chronomètre mis en pause: ${taskName}`,
      stop: `Chronomètre arrêté: ${taskName}`,
    }

    const icons = {
      start: <Play className="h-5 w-5 text-green-600" />,
      pause: <Timer className="h-5 w-5 text-yellow-600" />,
      stop: <Square className="h-5 w-5 text-red-600" />,
    }
    

    toast(messages[type], {
      icon: icons[type],
      duration: 3000,
      description: type === 'stop' ? 'Tâche sauvegardée automatiquement' : undefined,
    })
  }

  const showActionNotification = (action: string, success: boolean = true, details?: string) => {
    if (success) {
      toast.success(`${action} réalisé avec succès`, {
        icon: <CheckCircle className="h-5 w-5" />,
        description: details,
        duration: 3000,
      })
    } else {
      toast.error(`Erreur lors de ${action}`, {
        icon: <XCircle className="h-5 w-5" />,
        description: details,
        duration: 5000,
      })
    }
  }

  return {
    showNotification,
    showTimerNotification,
    showActionNotification,
    // Raccourcis pour les types courants
    success: (message: string, options?: any) => showNotification('success', message, options),
    error: (message: string, options?: any) => showNotification('error', message, options),
    warning: (message: string, options?: any) => showNotification('warning', message, options),
    info: (message: string, options?: any) => showNotification('info', message, options),
  }
}
