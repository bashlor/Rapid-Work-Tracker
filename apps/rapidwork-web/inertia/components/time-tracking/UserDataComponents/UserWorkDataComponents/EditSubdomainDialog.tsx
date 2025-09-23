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
import { Domain, Subdomain } from '@/lib/mock_data'

interface EditSubdomainDialogProps {
  domain: Domain | null
  onEdit: (domainId: string, subdomainId: string, newName: string) => Promise<void>
  onOpenChange: (open: boolean) => void
  open: boolean
  subdomain: null | Subdomain
}

export const EditSubdomainDialog = ({
  domain,
  onEdit,
  onOpenChange,
  open,
  subdomain,
}: EditSubdomainDialogProps) => {
  const [subdomainName, setSubdomainName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when dialog opens/closes or subdomain changes
  useEffect(() => {
    if (subdomain && open) {
      setSubdomainName(subdomain.name)
    } else if (!open) {
      setSubdomainName('')
    }
  }, [subdomain, open])

  const handleEdit = async () => {
    if (!domain || !subdomain || !subdomainName.trim()) return

    setIsLoading(true)
    try {
      await onEdit(domain.id, subdomain.id, subdomainName.trim())
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de la modification du sous-domaine:', error)
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
          <DialogTitle>
            Modifier le sous-domaine
            {domain && (
              <span className="block text-sm text-muted-foreground font-normal mt-1">
                Domaine: {domain.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subdomainName">Nom du sous-domaine</Label>
            <Input
              autoFocus
              disabled={isLoading}
              id="subdomainName"
              onChange={(e) => setSubdomainName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Frontend, Backend, UI/UX..."
              value={subdomainName}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isLoading} onClick={() => onOpenChange(false)} variant="outline">
            Annuler
          </Button>
          <Button
            disabled={
              isLoading || !subdomainName.trim() || subdomainName.trim() === subdomain?.name
            }
            onClick={handleEdit}
          >
            {isLoading ? 'Modification...' : 'Modifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
