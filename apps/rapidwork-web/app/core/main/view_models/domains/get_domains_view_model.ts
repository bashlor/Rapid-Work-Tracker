import type { Domain as DomainEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

interface GetDomainsInput {
  userId: string
}

export class GetDomainsViewModel extends ViewModelActionResponse<GetDomainsInput, DomainEntity[]> {
  publicHttpJsonResponse() {
    return this.entities.map((domain) => ({
      createdAt: domain.createdAt.toISOString(),
      id: domain.id.value,
      name: domain.name.value,
      subdomains: domain.subDomains.map((subdomain) => ({
        createdAt: subdomain.createdAt.toISOString(),
        id: subdomain.id.value,
        name: subdomain.name.value,
        updatedAt: subdomain.createdAt.toISOString(),
      })),
      updatedAt: domain.createdAt.toISOString(),
    }))
  }
}
