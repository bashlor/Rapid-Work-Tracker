import { inject } from '@adonisjs/core'
import { CreateDomainFeature } from 'domain-rapid-work'

import { CreateDomainViewModel } from '../../view_models/domains/create_domain_view_model.js'

@inject()
export class CreateDomainAction {
  constructor(private createDomainFeature: CreateDomainFeature) {}

  execute(name: string, userId: string) {
    return this.createDomainFeature
      .execute({ name, subDomains: [], userId })
      .then((domain) => new CreateDomainViewModel({ name, userId }, domain))
  }
}
