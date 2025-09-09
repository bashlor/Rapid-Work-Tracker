/**
 * DTO for Task with complete domain and subdomain relations
 */
export interface TaskWithRelationsDto {
  createdAt: string
  description: string
  domain: null | {
    createdAt: string
    id: string
    name: string
    updatedAt: string
  }
  domainId: null | string
  id: string
  status: string
  subdomain: null | {
    createdAt: string
    domainId: string
    id: string
    name: string
    updatedAt: string
  }
  subDomainId: null | string
  title: string
  updatedAt?: string
}
