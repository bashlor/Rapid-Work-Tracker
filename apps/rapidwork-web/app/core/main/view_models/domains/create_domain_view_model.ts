import type { Domain as DomainEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'
interface CreateDomainInput {
  name: string
  userId: string
}

export class CreateDomainViewModel extends ViewModelActionResponse<
  CreateDomainInput,
  DomainEntity
> {
  publicHttpJsonResponse() {
    return {
      createdAt: this.entities.createdAt.toISOString(),
      id: this.entities.id.value,
      name: this.entities.name.value,
      subdomains: this.entities.subDomains.map((subdomain) => ({
        createdAt: subdomain.createdAt.toISOString(),
        id: subdomain.id.value,
        name: subdomain.name.value,
        updatedAt: subdomain.createdAt.toISOString(),
      })),
      updatedAt: this.entities.createdAt.toISOString(),
    }
  }
}
