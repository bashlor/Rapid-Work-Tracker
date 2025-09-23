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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Domain } from '@/lib/mock_data'

interface AddSubdomainDialogProps {
  domains: Domain[]
  newSubdomainName: string
  onAdd: () => void
  onDomainIdChange: (domainId: string) => void
  onOpenChange: (open: boolean) => void
  onSubdomainNameChange: (name: string) => void
  open: boolean
  selectedDomainId: string
  trigger?: React.ReactNode
}

export function AddSubdomainDialog({
  domains,
  newSubdomainName,
  onAdd,
  onDomainIdChange,
  onOpenChange,
  onSubdomainNameChange,
  open,
  selectedDomainId,
  trigger,
}: AddSubdomainDialogProps) {
  return (
    <>
      {trigger || <Button onClick={() => onOpenChange(true)}>Ajouter Sous-domaine</Button>}
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau sous-domaine</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="domainSelect">Domaine parent</Label>
              <Select onValueChange={onDomainIdChange} value={selectedDomainId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subdomainName">Nom du sous-domaine</Label>
              <Input
                id="subdomainName"
                onChange={(e) => onSubdomainNameChange(e.target.value)}
                placeholder="Ex: Frontend, Backend, UI/UX..."
                value={newSubdomainName}
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
