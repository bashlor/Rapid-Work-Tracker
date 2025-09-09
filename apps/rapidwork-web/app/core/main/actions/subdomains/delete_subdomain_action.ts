import { inject } from '@adonisjs/core'
import { DeleteSubDomainFeature } from 'domain-rapid-work'

import { DeleteSubdomainViewModel } from '../../view_models/subdomains/delete_subdomain_view_model.js'

@inject()
export class DeleteSubDomainAction {
  constructor(private deleteSubDomainFeature: DeleteSubDomainFeature) {}

  async execute(userId: string, subDomainId: string) {
    await this.deleteSubDomainFeature.execute({ subDomainId, userId })
    return new DeleteSubdomainViewModel({ subdomainId: subDomainId, userId }, true)
  }
}
