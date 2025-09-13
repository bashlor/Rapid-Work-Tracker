import type { SubDomain as SubDomainEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

import { SubdomainDto } from '../../../../dtos/subdomain_dto.js'

interface UpdateSubdomainInput {
  name: string
  subdomainId: string
  userId: string
}

export class UpdateSubdomainViewModel extends ViewModelActionResponse<
  UpdateSubdomainInput,
  SubDomainEntity,
  SubdomainDto
> {
  publicHttpJsonResponse(): SubdomainDto {
    return {
      createdAt: this.entities.createdAt.toISOString(),
      domainId: this.entities.domainId.value,
      id: this.entities.id.value,
      name: this.entities.name.value,
      updatedAt: this.entities.createdAt.toISOString(),
    }
  }
}
