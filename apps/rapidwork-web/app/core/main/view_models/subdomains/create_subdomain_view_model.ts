import type { SubDomain as SubDomainEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

interface CreateSubdomainInput {
  domainId: string
  name: string
  userId: string
}

export class CreateSubdomainViewModel extends ViewModelActionResponse<
  CreateSubdomainInput,
  SubDomainEntity
> {
  publicHttpJsonResponse() {
    return {
      createdAt: this.entities.createdAt.toISOString(),
      domainId: this.entities.domainId.value,
      id: this.entities.id.value,
      name: this.entities.name.value,
      updatedAt: this.entities.createdAt.toISOString(),
    }
  }
}
