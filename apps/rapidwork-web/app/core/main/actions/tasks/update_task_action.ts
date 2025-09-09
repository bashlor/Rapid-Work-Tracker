import { LucidDomainRepository } from '#repositories/lucid_domain_repository'
import { LucidSubDomainRepository } from '#repositories/lucid_subdomain_repository'
import { inject } from '@adonisjs/core'
import { TaskStatus, UpdateTaskFeature } from 'domain-rapid-work'

import { UpdateTaskViewModel } from '../../view_models/tasks/update_task_view_model.js'

@inject()
export class UpdateTaskAction {
  constructor(
    private updateTaskFeature: UpdateTaskFeature,
    private domainRepository: LucidDomainRepository,
    private subdomainRepository: LucidSubDomainRepository
  ) {}

  async execute(params: {
    description?: string
    domainId?: string
    status: TaskStatus
    subDomainId?: string
    taskId: string
    title: string
    userId: string
  }) {
    const task = await this.updateTaskFeature.execute(params)
    const vm = new UpdateTaskViewModel(
      {
        description: params.description ?? null,
        domainId: params.domainId ?? null,
        status: params.status.value,
        subDomainId: params.subDomainId ?? null,
        taskId: params.taskId,
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
