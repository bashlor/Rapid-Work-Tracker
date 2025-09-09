import DomainModel from '#models/domain'
import { Domain, DomainBuilder, SubDomainBuilder } from 'domain-rapid-work'

export class DomainMapper {
  static fromDomainToRaw(domain: Domain): any {
    return {
      id: domain.id.value,
      name: domain.name.value,
      subdomains: domain.subDomains.map((subDomain) => ({
        createdAt: subDomain.createdAt.toISOString(),
        domainId: subDomain.domainId.value,
        id: subDomain.id.value,
        name: subDomain.name.value,
      })),
      userId: domain.userId.value,
    }
  }

  static fromModelArrayToDomainArray(domainModels: DomainModel[]): Domain[] {
    return domainModels
      .map((model) => this.fromModelToDomain(model))
      .filter((domain): domain is Domain => domain !== null)
  }

  static fromModelToDomain(domainModel: DomainModel): Domain | null {
    if (!domainModel) return null

    // Vérifier que toutes les propriétés requises sont présentes
    if (!domainModel.id || !domainModel.userId || !domainModel.name) {
      console.error('Missing required properties in domain model:', {
        id: domainModel.id,
        name: domainModel.name,
        userId: domainModel.userId,
      })
      return null
    }

    // Mapper les sous-domaines
    const subDomains = domainModel.subdomains
      ? domainModel.subdomains.map((subDomainModel) =>
          new SubDomainBuilder()
            .withId(subDomainModel.id)
            .withDomainId(subDomainModel.domainId)
            .withName(subDomainModel.name)
            .withCreatedAt(subDomainModel.createdAt.toISO() ?? new Date().toISOString())
            .build()
        )
      : []

    return new DomainBuilder()
      .withId(domainModel.id)
      .withName(domainModel.name)
      .withUserId(domainModel.userId)
      .withCreatedAt(domainModel.createdAt.toISO() ?? new Date().toISOString())
      .withSubDomains(subDomains)
      .build()
  }
}
