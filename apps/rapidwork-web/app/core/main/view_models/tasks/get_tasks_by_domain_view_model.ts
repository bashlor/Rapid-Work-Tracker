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

interface GetTasksByDomainInput {
  domainId: string
  userId: string
}

@inject()
export class GetTasksByDomainViewModel extends ViewModelActionResponse<
  GetTasksByDomainInput,
  TaskEntity[],
  TaskWithRelationsDto[]
> {
  private domains: Map<string, DomainEntity> = new Map()

  private subdomains: Map<string, SubDomainEntity> = new Map()
  constructor(
    input: GetTasksByDomainInput,
    entities: TaskEntity[],
    private domainRepository: LucidDomainRepository,
    private subdomainRepository: LucidSubDomainRepository
  ) {
    super(input, entities)
  }

  /**
   * Load all related domains and subdomains for the tasks
   */
  async loadRelations(): Promise<void> {
    const userId = new Id(this.input.userId)

    // Get unique domain IDs
    const domainIds = new Set<string>()
    const subdomainIds = new Set<string>()

    for (const task of this.entities) {
      if (task.domainId) {
        domainIds.add(task.domainId.value)
      }
      if (task.subDomainId) {
        subdomainIds.add(task.subDomainId.value)
      }
    }

    // Load domains
    for (const domainId of domainIds) {
      const domain = await this.domainRepository.getById(userId, new Id(domainId))
      if (domain) {
        this.domains.set(domainId, domain)
      }
    }

    // Load subdomains
    for (const subdomainId of subdomainIds) {
      const subdomain = await this.subdomainRepository.getById(userId, new Id(subdomainId))
      if (subdomain) {
        this.subdomains.set(subdomainId, subdomain)
      }
    }
  }

  publicHttpJsonResponse(): TaskWithRelationsDto[] {
    return this.entities.map((task) => {
      const domain = task.domainId ? this.domains.get(task.domainId.value) : null
      const subdomain = task.subDomainId ? this.subdomains.get(task.subDomainId.value) : null

      return {
        createdAt: task.createdAt.toISOString(),
        description: task.description.value,
        domain: domain
          ? {
              createdAt: domain.createdAt.toISOString(),
              id: domain.id.value,
              name: domain.name.value,
              updatedAt: domain.createdAt.toISOString(),
            }
          : null,
        domainId: task.domainId?.value || null,
        id: task.id.value,
        status: task.status.value,
        subdomain: subdomain
          ? {
              createdAt: subdomain.createdAt.toISOString(),
              domainId: subdomain.domainId.value,
              id: subdomain.id.value,
              name: subdomain.name.value,
              updatedAt: subdomain.createdAt.toISOString(),
            }
          : null,
        subDomainId: task.subDomainId?.value || null,
        title: task.title.value,
        updatedAt: task.createdAt.toISOString(),
      }
    })
  }
}
