import type { Domain as DomainEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

import { DomainWithSubdomainsDto } from './domain_dto.js'

interface UpdateDomainInput {
  domainId: string
  name: string
  userId: string
}

export class UpdateDomainViewModel extends ViewModelActionResponse<
  UpdateDomainInput,
  DomainEntity,
  DomainWithSubdomainsDto
> {
  get publicHttpJsonResponse(): DomainWithSubdomainsDto {
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
