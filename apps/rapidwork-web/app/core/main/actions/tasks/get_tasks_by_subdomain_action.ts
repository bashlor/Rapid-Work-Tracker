import { LucidDomainRepository } from '#repositories/lucid_domain_repository'
import { LucidSubDomainRepository } from '#repositories/lucid_subdomain_repository'
import { inject } from '@adonisjs/core'
import { GetTasksFeature } from 'domain-rapid-work'

import { GetTasksBySubdomainViewModel } from '../../view_models/tasks/get_tasks_by_subdomain_view_model.js'

@inject()
export class GetTasksBySubdomainAction {
  constructor(
    private getTasksFeature: GetTasksFeature,
    private domainRepository: LucidDomainRepository,
    private subdomainRepository: LucidSubDomainRepository
  ) {}

  async execute(userId: string, subDomainId: string) {
    const tasks = await this.getTasksFeature.execute({ subDomainId, userId })
    const vm = new GetTasksBySubdomainViewModel(
      { subdomainId: subDomainId, userId },
      tasks,
      this.domainRepository,
      this.subdomainRepository
    )
    await vm.loadRelations()
    return vm
  }
}
