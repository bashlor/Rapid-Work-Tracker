import { inject } from '@adonisjs/core'
import { DeleteDomainFeature } from 'domain-rapid-work'

import { DeleteDomainViewModel } from '../../view_models/domains/delete_domain_view_model.js'

@inject()
export class DeleteDomainAction {
  constructor(private deleteDomainFeature: DeleteDomainFeature) {}

  async execute(userId: string, domainId: string) {
    await this.deleteDomainFeature.execute({ domainId, userId })
    return new DeleteDomainViewModel({ domainId, userId }, true)
  }
}
