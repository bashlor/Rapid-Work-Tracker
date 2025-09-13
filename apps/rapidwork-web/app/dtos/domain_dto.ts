/**
 * DTO for Domain with subdomains
 */
export interface DomainWithSubdomainsDto {
  createdAt: string
  id: string
  name: string
  subdomains: {
    createdAt: string
    id: string
    name: string
    updatedAt: string
  }[]
  updatedAt: string
}
