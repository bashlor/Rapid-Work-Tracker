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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Domain } from '@/lib/mock_data'

interface AddSubdomainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  domains: Domain[]
  newSubdomainName: string
  onSubdomainNameChange: (name: string) => void
  selectedDomainId: string
  onDomainIdChange: (domainId: string) => void
  onAdd: () => void
  trigger?: React.ReactNode
}

export function AddSubdomainDialog({
  open,
  onOpenChange,
  domains,
  newSubdomainName,
  onSubdomainNameChange,
  selectedDomainId,
  onDomainIdChange,
  onAdd,
  trigger,
}: AddSubdomainDialogProps) {
  return (
    <>
      {trigger || <Button onClick={() => onOpenChange(true)}>Ajouter Sous-domaine</Button>}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau sous-domaine</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="domainSelect">Domaine parent</Label>
              <Select value={selectedDomainId} onValueChange={onDomainIdChange}>
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
                value={newSubdomainName}
                onChange={(e) => onSubdomainNameChange(e.target.value)}
                placeholder="Ex: Frontend, Backend, UI/UX..."
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
