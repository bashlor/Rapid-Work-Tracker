import { inject } from '@adonisjs/core'
import { EditDomainFeature } from 'domain-rapid-work'

import { UpdateDomainViewModel } from '../../view_models/domains/update_domain_view_model.js'

@inject()
export class EditDomainAction {
  constructor(private editDomainFeature: EditDomainFeature) {}

  async execute(userId: string, domainId: string, name: string) {
    const domain = await this.editDomainFeature.execute({
      domainId,
      name,
      subDomains: [],
      userId,
    })
    return new UpdateDomainViewModel({ domainId, name, userId }, domain)
  }
}
