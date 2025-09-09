import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Domain } from '@/lib/mock_data'

interface DeleteDomainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  domain: Domain | null
  onConfirm: () => void
  trigger?: React.ReactNode
}

export function DeleteDomainDialog({
  open,
  onOpenChange,
  domain,
  onConfirm,
  trigger,
}: DeleteDomainDialogProps) {
  return (
    <>
      {trigger}
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le domaine "{domain?.name}" ?
              {domain?.subdomains.length! > 0 && (
                <p className="mt-2 text-red-600">
                  Attention : Cela supprimera également tous les sous-domaines associés.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onOpenChange(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
