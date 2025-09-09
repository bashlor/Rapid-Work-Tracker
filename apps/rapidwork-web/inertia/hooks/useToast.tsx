import { toast } from 'sonner'

// Hook simplifié pour utiliser Sonner
export const useToast = () => {
  return {
    toast: (message: string, options?: Parameters<typeof toast>[1]) => {
      return toast(message, options)
    },
    success: (message: string, options?: Parameters<typeof toast.success>[1]) => {
      return toast.success(message, options)
    },
    error: (message: string, options?: Parameters<typeof toast.error>[1]) => {
      return toast.error(message, options)
    },
    warning: (message: string, options?: Parameters<typeof toast.warning>[1]) => {
      return toast.warning(message, options)
    },
    info: (message: string, options?: Parameters<typeof toast.info>[1]) => {
      return toast.info(message, options)
    },
    dismiss: (toastId?: string | number) => {
      return toast.dismiss(toastId)
    },
  }
}

// Export direct pour compatibilité
export { toast }
