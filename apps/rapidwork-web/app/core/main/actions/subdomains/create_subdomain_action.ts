import { inject } from '@adonisjs/core'
import { CreateSubDomainFeature } from 'domain-rapid-work'

import { CreateSubdomainViewModel } from '../../view_models/subdomains/create_subdomain_view_model.js'

@inject()
export class CreateSubDomainAction {
  constructor(private createSubDomainFeature: CreateSubDomainFeature) {}

  execute(name: string, domainId: string, userId: string) {
    return this.createSubDomainFeature
      .execute({ domainId, name, userId })
      .then((subdomain) => new CreateSubdomainViewModel({ domainId, name, userId }, subdomain))
  }
}
