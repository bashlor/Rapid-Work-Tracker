import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AddDomainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newDomainName: string
  onDomainNameChange: (name: string) => void
  onAdd: () => void
  trigger?: React.ReactNode
}

export function AddDomainDialog({
  open,
  onOpenChange,
  newDomainName,
  onDomainNameChange,
  onAdd,
  trigger,
}: AddDomainDialogProps) {
  return (
    <>
      {trigger || <Button onClick={() => onOpenChange(true)}>Ajouter Domaine</Button>}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau domaine</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="domainName">Nom du domaine</Label>
              <Input
                id="domainName"
                value={newDomainName}
                onChange={(e) => onDomainNameChange(e.target.value)}
                placeholder="Ex: Développement, Marketing, Design..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={onAdd}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
