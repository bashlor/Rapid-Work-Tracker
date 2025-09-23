import { useEffect, useState } from 'react'

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
import { Domain } from '@/lib/mock_data'

interface EditDomainDialogProps {
  domain: Domain | null
  onEdit: (domainId: string, newName: string) => Promise<void>
  onOpenChange: (open: boolean) => void
  open: boolean
}

export const EditDomainDialog = ({ domain, onEdit, onOpenChange, open }: EditDomainDialogProps) => {
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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le domaine</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="domainName">Nom du domaine</Label>
            <Input
              autoFocus
              disabled={isLoading}
              id="domainName"
              onChange={(e) => setDomainName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Logiciel, Gestion, Formation..."
              value={domainName}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isLoading} onClick={() => onOpenChange(false)} variant="outline">
            Annuler
          </Button>
          <Button
            disabled={isLoading || !domainName.trim() || domainName.trim() === domain?.name}
            onClick={handleEdit}
          >
            {isLoading ? 'Modification...' : 'Modifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
