import { Id } from "../../../../kernel/id"
import { DomainCollection } from "../../collections/DomainCollection"
import { SubDomainCollection } from "../../collections/SubDomainCollection"
import { TaskCollection } from "../../collections/TaskCollection"
import { Domain } from "../../entities/domain/Domain"
import { CannotDeleteDomainWithTasksError, CannotDeleteSubDomainWithTasksError, DomainNotFoundError } from "../../errors/DomainError"
import { Feature } from "../Feature"

export interface DeleteDomainParams {
    domainId: string
    userId: string
}

/**
 * Delete a domain with its sub-domains
 * @param domainId - The ID of the domain to delete
 * @returns The deleted domain
 */
export class DeleteDomainFeature implements Feature<DeleteDomainParams, Domain> {
  constructor(private domainCollection: DomainCollection, private subDomainCollection: SubDomainCollection, private taskCollection: TaskCollection) {}

  async execute(params: DeleteDomainParams) {
    const domainId = new Id(params.domainId)
    const userId = new Id(params.userId)

    const foundDomain = await this.domainCollection.getById(userId, domainId)
    if (!foundDomain) {
      throw new DomainNotFoundError(domainId.value)
    }

    const subDomains = await this.subDomainCollection.getAllByDomainId(userId, domainId)
    if (subDomains.length > 0) {
      throw new CannotDeleteSubDomainWithTasksError({ domainId: domainId.value })
    }

    const tasks = await this.taskCollection.getAllByDomainId(userId, domainId)
    if (tasks.length > 0) {
      throw new CannotDeleteDomainWithTasksError(domainId.value)
    }

    await this.domainCollection.delete(userId, foundDomain.id)

    return foundDomain
  }
}