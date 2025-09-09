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
import { Domain, Subdomain } from '@/lib/mock_data'

interface EditSubdomainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  domain: Domain | null
  subdomain: Subdomain | null
  onEdit: (domainId: string, subdomainId: string, newName: string) => Promise<void>
}

export const EditSubdomainDialog = ({
  open,
  onOpenChange,
  domain,
  subdomain,
  onEdit,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              id="subdomainName"
              value={subdomainName}
              onChange={(e) => setSubdomainName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Frontend, Backend, UI/UX..."
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
            disabled={
              isLoading || !subdomainName.trim() || subdomainName.trim() === subdomain?.name
            }
          >
            {isLoading ? 'Modification...' : 'Modifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
