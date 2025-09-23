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
  domain: Domain | null
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  trigger?: React.ReactNode
}

export function DeleteDomainDialog({
  domain,
  onConfirm,
  onOpenChange,
  open,
  trigger,
}: DeleteDomainDialogProps) {
  return (
    <>
      {trigger}
      <AlertDialog onOpenChange={onOpenChange} open={open}>
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
