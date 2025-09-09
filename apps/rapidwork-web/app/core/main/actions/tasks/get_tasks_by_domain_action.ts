import { LucidDomainRepository } from '#repositories/lucid_domain_repository'
import { LucidSubDomainRepository } from '#repositories/lucid_subdomain_repository'
import { inject } from '@adonisjs/core'
import { GetTasksFeature } from 'domain-rapid-work'

import { GetTasksByDomainViewModel } from '../../view_models/tasks/get_tasks_by_domain_view_model.js'

@inject()
export class GetTasksByDomainAction {
  constructor(
    private getTasksFeature: GetTasksFeature,
    private domainRepository: LucidDomainRepository,
    private subdomainRepository: LucidSubDomainRepository
  ) {}

  async execute(userId: string, domainId: string) {
    const tasks = await this.getTasksFeature.execute({ domainId, userId })
    const vm = new GetTasksByDomainViewModel(
      { domainId, userId },
      tasks,
      this.domainRepository,
      this.subdomainRepository
    )
    await vm.loadRelations()
    return vm
  }
}
