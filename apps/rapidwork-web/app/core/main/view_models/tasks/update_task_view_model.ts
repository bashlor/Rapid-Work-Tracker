import type {
  Domain as DomainEntity,
  SubDomain as SubDomainEntity,
  Task as TaskEntity,
} from 'domain-rapid-work'

import { LucidDomainRepository } from '#repositories/lucid_domain_repository'
import { LucidSubDomainRepository } from '#repositories/lucid_subdomain_repository'
import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'
import { inject } from '@adonisjs/core'
import { Id } from 'domain-rapid-work'

import { TaskWithRelationsDto } from './task_with_relations_dto.js'

interface UpdateTaskInput {
  description?: null | string
  domainId?: null | string
  status: string
  subDomainId?: null | string
  taskId: string
  title: string
  userId: string
}

@inject()
export class UpdateTaskViewModel extends ViewModelActionResponse<
  UpdateTaskInput,
  TaskEntity,
  TaskWithRelationsDto
> {
  private domain: DomainEntity | null = null

  private subdomain: null | SubDomainEntity = null
  constructor(
    input: UpdateTaskInput,
    entity: TaskEntity,
    private domainRepository: LucidDomainRepository,
    private subdomainRepository: LucidSubDomainRepository
  ) {
    super(input, entity)
  }

  /**
   * Load related domain and subdomain for the task
   */
  async loadRelations(): Promise<void> {
    const userId = new Id(this.input.userId)

    if (this.entities.domainId) {
      this.domain = await this.domainRepository.getById(userId, this.entities.domainId)
    }

    if (this.entities.subDomainId) {
      this.subdomain = await this.subdomainRepository.getById(userId, this.entities.subDomainId)
    }
  }

  publicHttpJsonResponse(): TaskWithRelationsDto {
    return {
      createdAt: this.entities.createdAt.toISOString(),
      description: this.entities.description.value,
      domain: this.domain
        ? {
            createdAt: this.domain.createdAt.toISOString(),
            id: this.domain.id.value,
            name: this.domain.name.value,
            updatedAt: this.domain.createdAt.toISOString(),
          }
        : null,
      domainId: this.entities.domainId?.value || null,
      id: this.entities.id.value,
      status: this.entities.status?.value || 'pending',
      subdomain: this.subdomain
        ? {
            createdAt: this.subdomain.createdAt.toISOString(),
            domainId: this.subdomain.domainId.value,
            id: this.subdomain.id.value,
            name: this.subdomain.name.value,
            updatedAt: this.subdomain.createdAt.toISOString(),
          }
        : null,
      subDomainId: this.entities.subDomainId?.value || null,
      title: this.entities.title.value,
      updatedAt: this.entities.createdAt.toISOString(),
    }
  }
}
