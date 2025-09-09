import { inject } from '@adonisjs/core'
import { UpdateSubDomainFeature } from 'domain-rapid-work'

import { UpdateSubdomainViewModel } from '../../view_models/subdomains/update_subdomain_view_model.js'

@inject()
export class EditSubDomainAction {
  constructor(private updateSubDomainFeature: UpdateSubDomainFeature) {}

  async execute(userId: string, subDomainId: string, name: string) {
    const subDomain = await this.updateSubDomainFeature.execute({
      name,
      subDomainId,
      userId,
    })
    return new UpdateSubdomainViewModel({ name, subdomainId: subDomainId, userId }, subDomain)
  }
}
