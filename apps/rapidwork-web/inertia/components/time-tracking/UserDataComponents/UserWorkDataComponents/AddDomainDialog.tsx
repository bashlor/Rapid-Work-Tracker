import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AddDomainDialogProps {
  newDomainName: string
  onAdd: () => void
  onDomainNameChange: (name: string) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  trigger?: React.ReactNode
}

export function AddDomainDialog({
  newDomainName,
  onAdd,
  onDomainNameChange,
  onOpenChange,
  open,
  trigger,
}: AddDomainDialogProps) {
  return (
    <>
      {trigger || <Button onClick={() => onOpenChange(true)}>Ajouter Domaine</Button>}
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau domaine</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="domainName">Nom du domaine</Label>
              <Input
                id="domainName"
                onChange={(e) => onDomainNameChange(e.target.value)}
                placeholder="Ex: Développement, Marketing, Design..."
                value={newDomainName}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Annuler
            </Button>
            <Button onClick={onAdd}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
