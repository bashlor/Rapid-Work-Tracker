import React, { useState } from 'react'

import type { Domain, SubDomain } from '@/types/page_props'

import { useDomainsManagement } from '@/hooks/useDomainsManagement'
import { useNotification } from '@/hooks/useNotification'
import { useTasksManagement } from '@/hooks/useTasksManagement'

import { AddDomainDialog } from './AddDomainDialog'
import { AddSubdomainDialog } from './AddSubdomainDialog'
import { DeleteDomainDialog } from './DeleteDomainDialog'
import { DomainList } from './DomainList'
import { EditDomainDialog } from './EditDomainDialog'
import { EditSubdomainDialog } from './EditSubdomainDialog'

interface DomainsTabProps {
  domains: Domain[]
  isLoading: boolean
}

export const DomainsTab = ({ domains }: DomainsTabProps) => {
  const { addDomain, addSubdomain, deleteDomain, deleteSubdomain, editSubdomain, updateDomain } =
    useDomainsManagement()
  const { tasks } = useTasksManagement()
  const { error, showActionNotification } = useNotification()
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false)
  const [isAddSubdomainOpen, setIsAddSubdomainOpen] = useState(false)
  const [isDeleteDomainDialogOpen, setIsDeleteDomainDialogOpen] = useState(false)
  const [isEditDomainOpen, setIsEditDomainOpen] = useState(false)
  const [isEditSubdomainOpen, setIsEditSubdomainOpen] = useState(false)
  const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [editingSubdomain, setEditingSubdomain] = useState<null | {
    domain: Domain
    subdomain: SubDomain
  }>(null)
  const [newDomain, setNewDomain] = useState({ name: '' })
  const [newSubdomain, setNewSubdomain] = useState({
    domainId: '',
    name: '',
  })

  // Function to check if a domain is used by any tasks
  const isDomainInUse = (domainName: string) => {
    return tasks.some((task) => task.domain?.name === domainName)
  }

  // Function to check if a subdomain is used by any tasks
  const isSubdomainInUse = (domainName: string, subdomainName: string) => {
    return tasks.some(
      (task) => task.domain?.name === domainName && task.subdomain?.name === subdomainName
    )
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
    setNewSubdomain({ domainId: '', name: '' })
    setIsAddSubdomainOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <AddDomainDialog
          newDomainName={newDomain.name}
          onAdd={handleAddDomain}
          onDomainNameChange={(name) => setNewDomain({ ...newDomain, name })}
          onOpenChange={setIsAddDomainOpen}
          open={isAddDomainOpen}
        />

        <AddSubdomainDialog
          domains={domains}
          newSubdomainName={newSubdomain.name}
          onAdd={handleAddSubdomain}
          onDomainIdChange={(domainId) => setNewSubdomain({ ...newSubdomain, domainId })}
          onOpenChange={setIsAddSubdomainOpen}
          onSubdomainNameChange={(name) => setNewSubdomain({ ...newSubdomain, name })}
          open={isAddSubdomainOpen}
          selectedDomainId={newSubdomain.domainId}
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
        domains={domains.map((domain) => ({
          id: domain.id,
          name: domain.name,
          subdomains: domain.subdomains.map((sub) => ({
            id: sub.id,
            name: sub.name,
          })),
        }))}
        onAddSubdomain={(mockDomain) => {
          const realDomain = domains.find((d) => d.id === mockDomain.id)
          if (realDomain) {
            setNewSubdomain({ domainId: realDomain.id, name: '' })
            setIsAddSubdomainOpen(true)
          }
        }}
        onDeleteDomain={(mockDomain) => {
          const realDomain = domains.find((d) => d.id === mockDomain.id)
          if (realDomain) {
            handleDeleteDomain(realDomain)
          }
        }}
        onDeleteSubdomain={(mockDomain, mockSubdomain) => {
          const realDomain = domains.find((d) => d.id === mockDomain.id)
          const realSubdomain = realDomain?.subdomains.find((s) => s.id === mockSubdomain.id)
          if (realDomain && realSubdomain) {
            // Convert Subdomain to SubDomain for the handler
            const subDomainObj: SubDomain = {
              createdAt: '',
              description: '',
              domainId: realDomain.id,
              id: realSubdomain.id,
              label: realSubdomain.name,
              updatedAt: '',
            }
            handleDeleteSubdomain(realDomain, subDomainObj)
          }
        }}
        onEditDomain={(mockDomain) => {
          const realDomain = domains.find((d) => d.id === mockDomain.id)
          if (realDomain) {
            handleEditDomain(realDomain)
          }
        }}
        onEditSubdomain={(mockDomain, mockSubdomain) => {
          const realDomain = domains.find((d) => d.id === mockDomain.id)
          const realSubdomain = realDomain?.subdomains.find((s) => s.id === mockSubdomain.id)
          if (realDomain && realSubdomain) {
            // Convert Subdomain to SubDomain for the handler
            const subDomainObj: SubDomain = {
              createdAt: '',
              description: '',
              domainId: realDomain.id,
              id: realSubdomain.id,
              label: realSubdomain.name,
              updatedAt: '',
            }
            handleEditSubdomain(realDomain, subDomainObj)
          }
        }}
      />

      {/* Delete Domain Dialog */}
      <DeleteDomainDialog
        domain={deletingDomain}
        onConfirm={confirmDeleteDomain}
        onOpenChange={setIsDeleteDomainDialogOpen}
        open={isDeleteDomainDialogOpen}
      />

      {/* Edit Domain Dialog */}
      <EditDomainDialog
        domain={editingDomain}
        onEdit={confirmEditDomain}
        onOpenChange={setIsEditDomainOpen}
        open={isEditDomainOpen}
      />

      {/* Edit Subdomain Dialog */}
      <EditSubdomainDialog
        domain={
          editingSubdomain?.domain
            ? {
                id: editingSubdomain.domain.id,
                name: editingSubdomain.domain.name,
                subdomains: editingSubdomain.domain.subdomains.map((sub) => ({
                  id: sub.id,
                  name: sub.name,
                })),
              }
            : null
        }
        onEdit={async (_domainId: string, subdomainId: string, newName: string) => {
          if (newName.trim()) {
            await editSubdomain(subdomainId, { name: newName.trim() })
          }
        }}
        onOpenChange={setIsEditSubdomainOpen}
        open={isEditSubdomainOpen}
        subdomain={
          editingSubdomain?.subdomain
            ? {
                id: editingSubdomain.subdomain.id,
                name: editingSubdomain.subdomain.label,
              }
            : null
        }
      />
    </div>
  )
}
