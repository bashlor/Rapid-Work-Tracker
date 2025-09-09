import { LucidDomainRepository } from '#repositories/lucid_domain_repository'
import { LucidSubDomainRepository } from '#repositories/lucid_subdomain_repository'
import { inject } from '@adonisjs/core'
import { GetTasksFeature } from 'domain-rapid-work'

import { GetTasksViewModel } from '../../view_models/tasks/get_tasks_view_model.js'

@inject()
export class GetTasksAction {
  constructor(
    private getTasksFeature: GetTasksFeature,
    private domainRepository: LucidDomainRepository,
    private subdomainRepository: LucidSubDomainRepository
  ) {}

  async execute(userId: string) {
    const tasks = await this.getTasksFeature.execute({ userId })

    const viewModel = new GetTasksViewModel(
      { userId },
      tasks,
      this.domainRepository,
      this.subdomainRepository
    )

    await viewModel.loadRelations()

    return viewModel
  }
}
