import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { BackendDomainWithSubdomains, BackendSubdomain } from '@/types/backend'

import { tuyau } from '@/tuyau'

import { useNotification } from './useNotification'

// Query Keys
export const domainsKeys = {
  all: ['domains'] as const,
  detail: (id: string) => [...domainsKeys.details(), id] as const,
  details: () => [...domainsKeys.all, 'detail'] as const,
  list: (filters: Record<string, any>) => [...domainsKeys.lists(), { filters }] as const,
  lists: () => [...domainsKeys.all, 'list'] as const,
}

export const useDomainsManagement = (initialData?: BackendDomainWithSubdomains[]) => {
  const { error: errorNotification } = useNotification()
  const queryClient = useQueryClient()

  const {
    data: domains = [],
    error,
    isLoading: loading,
    refetch,
  } = useQuery<BackendDomainWithSubdomains[]>({
    initialData: initialData,
    queryFn: async (): Promise<BackendDomainWithSubdomains[]> => {
      const response = await tuyau.api.domains.$get()
      return response.data as BackendDomainWithSubdomains[]
    },
    queryKey: domainsKeys.lists(),
    staleTime: 15 * 60 * 1000,
  })

  const createDomainMutation = useMutation<BackendDomainWithSubdomains, Error, { name: string }>({
    mutationFn: async (newDomainData: { name: string }): Promise<BackendDomainWithSubdomains> => {
      const response = await tuyau.api.domains.$post({
        name: newDomainData.name,
      })
      return response.data as unknown as BackendDomainWithSubdomains
    },
    onError: (error) => {
      console.error(error)
      errorNotification("Erreur lors de l'ajout du domaine")
    },
    onSuccess: () => {
      // Refresh the data from server
      queryClient.invalidateQueries({ queryKey: domainsKeys.lists() })
    },
  })

  const updateDomainMutation = useMutation<BackendDomainWithSubdomains, Error, { id: string; name: string }>({
    mutationFn: async (updatedDomainData: { id: string; name: string }) => {
      const response = await tuyau.api
        .domains({
          domain_id: updatedDomainData.id,
        })
        .$patch({
          name: updatedDomainData.name,
        })
      return response.data as unknown as BackendDomainWithSubdomains
    },
    onError: (error) => {
      console.error(error)
      errorNotification('Erreur lors de la mise à jour du domaine')
    },
    onSuccess: () => {
      // Refresh the data from server instead of optimistic update
      queryClient.invalidateQueries({ queryKey: domainsKeys.lists() })
    },
  })

  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      await tuyau.api
        .domains({
          domain_id: domainId,
        })
        .$delete()
      return domainId
    },
    onError: (error) => {
      console.error(error)
      errorNotification('Erreur lors de la suppression du domaine')
      queryClient.invalidateQueries({ queryKey: domainsKeys.lists() })
    },
    onSuccess: (deletedId) => {
      // Optimistic update
      queryClient.setQueryData(domainsKeys.lists(), (oldDomains: BackendDomainWithSubdomains[] | undefined) => {
        if (!oldDomains) return []
        return oldDomains.filter((domain) => domain.id !== deletedId)
      })
    },
  }) 

  const createSubdomainMutation = useMutation({
    mutationFn: async ({ domainId, name }: { domainId: string; name: string }) => {
      const response = await tuyau.api.subdomains.$post({
        domain_id: domainId,
        name: name,
      })
      return response.data as unknown as BackendSubdomain
    },
    onError: (error) => {
      console.error(error)
      errorNotification("Erreur lors de l'ajout du sous-domaine")
    },
    onSuccess: () => {
      // Refresh the domains list to get updated subdomains
      queryClient.invalidateQueries({ queryKey: domainsKeys.lists() })
    },
  })

  const deleteSubdomainMutation = useMutation({
    mutationFn: async (subdomainId: string) => {
      await tuyau.api.subdomains({
        subdomain_id: subdomainId,
      }).$delete()
      return subdomainId
    },
    onError: (error) => {
      console.error(error)
      errorNotification("Erreur lors de la suppression du sous-domaine")
      queryClient.invalidateQueries({ queryKey: domainsKeys.lists() })
    },
    onSuccess: (deletedId) => {
      // Optimistic update
      queryClient.setQueryData(domainsKeys.lists(), (oldDomains: BackendDomainWithSubdomains[] | undefined) => {
        if (!oldDomains) return []
        return oldDomains.map((domain) => {
          return {
            ...domain,
            subdomains: domain.subdomains.filter((subdomain: BackendSubdomain) => subdomain.id !== deletedId),
          }
        })
      })
    },
  })

  const editSubdomainMutation = useMutation({
    mutationFn: async ({ name, subdomainId }: { name: string; subdomainId: string; }) => {
      const response = await tuyau.api.subdomains({
        subdomain_id: subdomainId,
      }).$patch({ name })
      return response.data as unknown as BackendSubdomain
    },
    onError: (error) => {
      console.error(error)
      errorNotification("Erreur lors de la mise à jour du sous-domaine")
    },
    onSuccess: () => {
      // Refresh the domains list to get updated subdomains
      queryClient.invalidateQueries({ queryKey: domainsKeys.lists() })
    },
  })

    // Wrapper functions pour garder la même API
  const addDomain = async (domainData: { name: string }): Promise<boolean> => {
    try {
      await createDomainMutation.mutateAsync(domainData)
      return true
    } catch {
      return false
    }
  }

  const updateDomain = async (domainData: { id: string; name: string }): Promise<boolean> => {
    try {
      await updateDomainMutation.mutateAsync(domainData)
      return true
    } catch {
      return false
    }
  }

  const deleteDomain = async (domainId: string): Promise<boolean> => {
    try {
      await deleteDomainMutation.mutateAsync(domainId)
      return true
    } catch {
      return false
    }
  }

  const addSubdomain = async (domainId: string, subdomainData: { name: string }): Promise<boolean> => {
    try {
      await createSubdomainMutation.mutateAsync({ domainId, name: subdomainData.name })
      return true
    } catch {
      return false
    }
  }

  const deleteSubdomain = async (subdomainId: string): Promise<boolean> => {
    try {
      await deleteSubdomainMutation.mutateAsync(subdomainId)
      return true
    } catch {
      return false
    }
  }

  const editSubdomain = async (subdomainId: string, subdomainData: { name: string }): Promise<boolean> => {
    try {
      await editSubdomainMutation.mutateAsync({ name: subdomainData.name, subdomainId })
      return true
    } catch {
      return false
    }
  }

  return {
    addDomain,
    addSubdomain,
    deleteDomain,
    deleteSubdomain,
    domains,
    editSubdomain,
    error,
    loading,
    refetch,
    updateDomain,
  }
}
