import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Domain } from '@/lib/mock_data'

interface EditDomainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  domain: Domain | null
  onEdit: (domainId: string, newName: string) => Promise<void>
}

export const EditDomainDialog = ({ open, onOpenChange, domain, onEdit }: EditDomainDialogProps) => {
  const [domainName, setDomainName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when dialog opens/closes or domain changes
  useEffect(() => {
    if (domain && open) {
      setDomainName(domain.name)
    } else if (!open) {
      setDomainName('')
    }
  }, [domain, open])

  const handleEdit = async () => {
    if (!domain || !domainName.trim()) return

    setIsLoading(true)
    try {
      await onEdit(domain.id, domainName.trim())
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de la modification du domaine:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleEdit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le domaine</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="domainName">Nom du domaine</Label>
            <Input
              id="domainName"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Logiciel, Gestion, Formation..."
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleEdit}
            disabled={isLoading || !domainName.trim() || domainName.trim() === domain?.name}
          >
            {isLoading ? 'Modification...' : 'Modifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
