import { LucidDomainRepository } from '#repositories/lucid_domain_repository'
import { LucidSubDomainRepository } from '#repositories/lucid_subdomain_repository'
import { inject } from '@adonisjs/core'
import { CreateTaskFeature, TaskStatus } from 'domain-rapid-work'

import { CreateTaskViewModel } from '../../view_models/tasks/create_task_view_model.js'

@inject()
export class CreateTaskAction {
  constructor(
    private createTaskFeature: CreateTaskFeature,
    private domainRepository: LucidDomainRepository,
    private subdomainRepository: LucidSubDomainRepository
  ) {}

  async execute(params: {
    description?: string
    domainId?: string
    status: TaskStatus
    subDomainId?: string
    title: string
    userId: string
  }) {
    const task = await this.createTaskFeature.execute(params)

    const vm = new CreateTaskViewModel(
      {
        description: params.description ?? null,
        domainId: params.domainId ?? null,
        status: params.status.value,
        subDomainId: params.subDomainId ?? null,
        title: params.title,
        userId: params.userId,
      },
      task,
      this.domainRepository,
      this.subdomainRepository
    )

    await vm.loadRelations()

    return vm
  }
}
