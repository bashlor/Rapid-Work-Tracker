import { useState } from 'react'
import type { Domain, SubDomain } from '@/types/page_props'
import { useDomainsManagement } from '@/hooks/useDomainsManagement'
import { useTasksManagement } from '@/hooks/useTasksManagement'
import { useNotification } from '@/hooks/useNotification'
import { AddDomainDialog } from './AddDomainDialog'
import { AddSubdomainDialog } from './AddSubdomainDialog'
import { DeleteDomainDialog } from './DeleteDomainDialog'
import { EditDomainDialog } from './EditDomainDialog'
import { EditSubdomainDialog } from './EditSubdomainDialog'
import { DomainList } from './DomainList'

interface DomainsTabProps {
  domains: Domain[]
  isLoading: boolean
}

export const DomainsTab = ({ domains }: DomainsTabProps) => {
  const { addDomain, updateDomain, deleteDomain, addSubdomain, deleteSubdomain, editSubdomain } = useDomainsManagement()
  const { tasks } = useTasksManagement()
  const { showActionNotification, error } = useNotification()
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false)
  const [isAddSubdomainOpen, setIsAddSubdomainOpen] = useState(false)
  const [isDeleteDomainDialogOpen, setIsDeleteDomainDialogOpen] = useState(false)
  const [isEditDomainOpen, setIsEditDomainOpen] = useState(false)
  const [isEditSubdomainOpen, setIsEditSubdomainOpen] = useState(false)
  const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [editingSubdomain, setEditingSubdomain] = useState<{
    domain: Domain
    subdomain: SubDomain
  } | null>(null)
  const [newDomain, setNewDomain] = useState({ name: '' })
  const [newSubdomain, setNewSubdomain] = useState({
    name: '',
    domainId: '',
  })

  // Function to check if a domain is used by any tasks
  const isDomainInUse = (domainName: string) => {
    return tasks.some((task) => task.domain?.name === domainName)
  }

  // Function to check if a subdomain is used by any tasks
  const isSubdomainInUse = (domainName: string, subdomainName: string) => {
    return tasks.some((task) => task.domain?.name === domainName && task.subdomain?.name === subdomainName)
  }

  // Function to handle domain deletion
  const handleDeleteDomain = (domain: Domain) => {
    if (isDomainInUse(domain.name)) {
      error('Ce domaine ne peut pas être supprimé car il est utilisé par une ou plusieurs tâches')
      return
    }
    setDeletingDomain(domain)
    setIsDeleteDomainDialogOpen(true)
  }

  // Function to handle subdomain deletion
  const handleDeleteSubdomain = async (domain: Domain, subdomain: SubDomain) => {
    if (isSubdomainInUse(domain.name, subdomain.label)) {
      error(
        'Ce sous-domaine ne peut pas être supprimé car il est utilisé par une ou plusieurs tâches'
      )
      return
    }
    
    await deleteSubdomain(subdomain.id)
    showActionNotification(
      'la suppression du sous-domaine',
      true,
      `Le sous-domaine "${subdomain.label}" a été supprimé`
    )
  }

  // Function to confirm domain deletion
  const confirmDeleteDomain = async () => {
    if (!deletingDomain) return
    await deleteDomain(deletingDomain.id)
    setIsDeleteDomainDialogOpen(false)
    setDeletingDomain(null)
    showActionNotification(
      'la suppression du domaine',
      true,
      `"${deletingDomain.name}" a été supprimé`
    )
  }

  // Function to handle domain editing
  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain)
    setIsEditDomainOpen(true)
  }

  // Function to handle subdomain editing
  const handleEditSubdomain = (domain: Domain, subdomain: SubDomain) => {
    setEditingSubdomain({ domain, subdomain })
    setIsEditSubdomainOpen(true)
  }

  // Function to confirm domain edit
  const confirmEditDomain = async (domainId: string, newName: string) => {
    await updateDomain({ id: domainId, name: newName })
    showActionNotification(
      'la modification du domaine',
      true,
      `Le domaine a été renommé en "${newName}"`
    )
  }

  const handleAddDomain = async () => {
    if (!newDomain.name.trim()) {
      error('Le nom du domaine est requis')
      return
    }

    await addDomain({ name: newDomain.name })
    setNewDomain({ name: '' })
    setIsAddDomainOpen(false)
  }

  const handleAddSubdomain = async () => {
    if (!newSubdomain.name.trim() || !newSubdomain.domainId) {
      error('Le nom du sous-domaine et le domaine parent sont requis')
      return
    }

    await addSubdomain(newSubdomain.domainId, { name: newSubdomain.name })
    setNewSubdomain({ name: '', domainId: '' })
    setIsAddSubdomainOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <AddDomainDialog
          open={isAddDomainOpen}
          onOpenChange={setIsAddDomainOpen}
          newDomainName={newDomain.name}
          onDomainNameChange={(name) => setNewDomain({ ...newDomain, name })}
          onAdd={handleAddDomain}
        />

        <AddSubdomainDialog
          open={isAddSubdomainOpen}
          onOpenChange={setIsAddSubdomainOpen}
          domains={domains}
          newSubdomainName={newSubdomain.name}
          onSubdomainNameChange={(name) => setNewSubdomain({ ...newSubdomain, name })}
          selectedDomainId={newSubdomain.domainId}
          onDomainIdChange={(domainId) => setNewSubdomain({ ...newSubdomain, domainId })}
          onAdd={handleAddSubdomain}
        />
      </div>

      {/*
        <ImportDomainsSection
          domains={domains}
          addDomain={async (domain) => {
            await addDomain(domain)
          }}
          updateDomain={async (domain) => {
            await updateDomain(domain)
          }}
        />
      */}

      <DomainList
        domains={domains.map(domain => ({
          id: domain.id,
          name: domain.name,
          subdomains: domain.subdomains.map(sub => ({
            id: sub.id,
            name: sub.name
          }))
        }))}
        onAddSubdomain={(mockDomain) => {
          const realDomain = domains.find(d => d.id === mockDomain.id)
          if (realDomain) {
            setNewSubdomain({ name: '', domainId: realDomain.id })
            setIsAddSubdomainOpen(true)
          }
        }}
        onDeleteDomain={(mockDomain) => {
          const realDomain = domains.find(d => d.id === mockDomain.id)
          if (realDomain) {
            handleDeleteDomain(realDomain)
          }
        }}
        onDeleteSubdomain={(mockDomain, mockSubdomain) => {
          const realDomain = domains.find(d => d.id === mockDomain.id)
          const realSubdomain = realDomain?.subdomains.find(s => s.id === mockSubdomain.id)
          if (realDomain && realSubdomain) {
            // Convert Subdomain to SubDomain for the handler
            const subDomainObj: SubDomain = {
              id: realSubdomain.id,
              label: realSubdomain.name,
              createdAt: '',
              description: '',
              domainId: realDomain.id,
              updatedAt: ''
            }
            handleDeleteSubdomain(realDomain, subDomainObj)
          }
        }}
        onEditDomain={(mockDomain) => {
          const realDomain = domains.find(d => d.id === mockDomain.id)
          if (realDomain) {
            handleEditDomain(realDomain)
          }
        }}
        onEditSubdomain={(mockDomain, mockSubdomain) => {
          const realDomain = domains.find(d => d.id === mockDomain.id)
          const realSubdomain = realDomain?.subdomains.find(s => s.id === mockSubdomain.id)
          if (realDomain && realSubdomain) {
            // Convert Subdomain to SubDomain for the handler
            const subDomainObj: SubDomain = {
              id: realSubdomain.id,
              label: realSubdomain.name,
              createdAt: '',
              description: '',
              domainId: realDomain.id,
              updatedAt: ''
            }
            handleEditSubdomain(realDomain, subDomainObj)
          }
        }}
      />

      {/* Delete Domain Dialog */}
      <DeleteDomainDialog
        open={isDeleteDomainDialogOpen}
        onOpenChange={setIsDeleteDomainDialogOpen}
        domain={deletingDomain}
        onConfirm={confirmDeleteDomain}
      />

      {/* Edit Domain Dialog */}
      <EditDomainDialog
        open={isEditDomainOpen}
        onOpenChange={setIsEditDomainOpen}
        domain={editingDomain}
        onEdit={confirmEditDomain}
      />

      {/* Edit Subdomain Dialog */}
            <EditSubdomainDialog
        open={isEditSubdomainOpen}
        onOpenChange={setIsEditSubdomainOpen}
        domain={editingSubdomain?.domain ? {
          id: editingSubdomain.domain.id,
          name: editingSubdomain.domain.name,
          subdomains: editingSubdomain.domain.subdomains.map(sub => ({
            id: sub.id,
            name: sub.name
          }))
        } : null}
        subdomain={editingSubdomain?.subdomain ? {
          id: editingSubdomain.subdomain.id,
          name: editingSubdomain.subdomain.label
        } : null}
        onEdit={async (_domainId: string, subdomainId: string, newName: string) => {
          if (newName.trim()) {
            await editSubdomain(subdomainId, { name: newName.trim() })
          }
        }}
      />
    </div>
  )
}
