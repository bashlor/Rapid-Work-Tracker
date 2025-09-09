import { inject } from '@adonisjs/core'
import { GetDomainsFeature } from 'domain-rapid-work'

import { GetDomainsViewModel } from '../../view_models/domains/get_domains_view_model.js'

@inject()
export class GetDomainsAction {
  constructor(private readonly getDomainsFeature: GetDomainsFeature) {}

  async execute(userId: string) {
    const domains = await this.getDomainsFeature.execute({ userId })
    return new GetDomainsViewModel({ userId }, domains)
  }
}
