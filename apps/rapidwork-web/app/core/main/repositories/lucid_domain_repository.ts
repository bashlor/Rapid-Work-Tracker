import DomainModel from '#models/domain'
import { DomainCollection, Domain as DomainEntity, Id } from 'domain-rapid-work'

import { DomainMapper } from '../mappers/domain_mapper.js'

export class LucidDomainRepository extends DomainCollection {
  async delete(userId: Id, id: Id): Promise<boolean> {
    const domain = await DomainModel.query()
      .where('id', id.value)
      .where('userId', userId.value)
      .first()
    if (!domain) return false
    await domain.delete()
    return true
  }

  async existsByNameForUser(userId: Id, name: string): Promise<boolean> {
    const domain = await DomainModel.query()
      .where('userId', userId.value)
      .where('name', name)
      .first()
    return domain !== null
  }

  async getAllByUserId(userId: Id): Promise<DomainEntity[]> {
    const domains = await DomainModel.query().preload('subdomains').where('userId', userId.value)
    return DomainMapper.fromModelArrayToDomainArray(domains)
  }

  async getById(userId: Id, id: Id): Promise<DomainEntity | null> {
    const domain = await DomainModel.query()
      .preload('subdomains')
      .where('id', id.value)
      .where('userId', userId.value)
      .first()
    if (!domain) return null
    return DomainMapper.fromModelToDomain(domain)
  }

  async insert(domainEntity: DomainEntity): Promise<DomainEntity> {
    const domainModelData = DomainMapper.fromDomainToRaw(domainEntity)
    const domain = await DomainModel.create({
      id: domainModelData.id,
      name: domainModelData.name,
      userId: domainEntity.userId.value,
    })

    // Recharger le modèle avec toutes les propriétés pour s'assurer qu'elles sont définies
    const createdDomain = await DomainModel.query()
      .preload('subdomains')
      .where('id', domain.id)
      .first()

    if (!createdDomain) {
      throw new Error('Failed to create domain')
    }

    const mappedDomain = DomainMapper.fromModelToDomain(createdDomain)
    if (!mappedDomain) {
      throw new Error('Failed to map created domain')
    }
    return mappedDomain
  }

  async update(domainEntity: DomainEntity): Promise<DomainEntity> {
    const domain = await DomainModel.query()
      .preload('subdomains')
      .where('id', domainEntity.id.value)
      .first()
    if (!domain) throw new Error('Domain not found')
    domain.merge({ name: domainEntity.name.value })
    await domain.save()
    return DomainMapper.fromModelToDomain(domain)!
  }
}
