import SubDomainModel from '#models/subdomain'
import { Id, SubDomainCollection, SubDomain as SubDomainEntity } from 'domain-rapid-work'

import { SubDomainMapper } from '../mappers/subdomain_mapper.js'

export class LucidSubDomainRepository extends SubDomainCollection {
  async delete(userId: Id, id: Id): Promise<boolean> {
    const subDomain = await SubDomainModel.query()
      .where('id', id.value)
      .whereHas('domain', (query) => {
        query.where('userId', userId.value)
      })
      .first()
    if (!subDomain) return false
    await subDomain.delete()
    return true
  }

  async getAllByDomainId(userId: Id, domainId: Id): Promise<SubDomainEntity[]> {
    const subDomains = await SubDomainModel.query()
      .where('domainId', domainId.value)
      .whereHas('domain', (query) => {
        query.where('userId', userId.value)
      })
    return SubDomainMapper.toDomainArray(subDomains)
  }

  async getById(userId: Id, id: Id): Promise<null | SubDomainEntity> {
    const subDomain = await SubDomainModel.query()
      .where('id', id.value)
      .whereHas('domain', (query) => {
        query.where('userId', userId.value)
      })
      .first()
    return SubDomainMapper.toDomain(subDomain)
  }

  async insert(userId: Id, subDomainEntity: SubDomainEntity): Promise<SubDomainEntity> {
    // Verify that the domain belongs to the user using Domain model directly
    const { default: DomainModel } = await import('#models/domain')

    const domain = await DomainModel.query()
      .where('id', subDomainEntity.domainId.value)
      .where('userId', userId.value)
      .first()

    if (!domain) {
      throw new Error('Domain not found or does not belong to user')
    }

    const subDomainModelData = SubDomainMapper.fromDomain(subDomainEntity)
    const subDomain = await SubDomainModel.create({
      domainId: subDomainModelData.domainId,
      id: subDomainModelData.id,
      name: subDomainModelData.name,
    })
    return SubDomainMapper.toDomain(subDomain)!
  }

  async insertMany(userId: Id, subDomains: SubDomainEntity[]): Promise<SubDomainEntity[]> {
    const results: SubDomainEntity[] = []
    for (const subDomain of subDomains) {
      const result = await this.insert(userId, subDomain)
      results.push(result)
    }
    return results
  }

  async update(userId: Id, subDomainEntity: SubDomainEntity): Promise<SubDomainEntity> {
    const subDomain = await SubDomainModel.query()
      .where('id', subDomainEntity.id.value)
      .whereHas('domain', (query) => {
        query.where('userId', userId.value)
      })
      .firstOrFail()
    subDomain.merge({ name: subDomainEntity.name.value })
    await subDomain.save()
    return SubDomainMapper.toDomain(subDomain)!
  }

  async updateMany(userId: Id, subDomains: SubDomainEntity[]): Promise<SubDomainEntity[]> {
    const updatedSubDomains: SubDomainEntity[] = []
    for (const subDomainEntity of subDomains) {
      const updated = await this.update(userId, subDomainEntity)
      updatedSubDomains.push(updated)
    }
    return updatedSubDomains
  }
}
