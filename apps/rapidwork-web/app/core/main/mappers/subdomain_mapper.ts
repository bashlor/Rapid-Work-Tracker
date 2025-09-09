import { SubDomain, SubDomainBuilder } from 'domain-rapid-work'

export class SubDomainMapper {
  static fromDomain(subDomain: SubDomain): any {
    return {
      createdAt: new Date(subDomain.createdAt.toISOString()),
      domainId: subDomain.domainId.value,
      id: subDomain.id.value,
      name: subDomain.name.value,
    }
  }

  static toDomain(subDomainModel: any): null | SubDomain {
    if (!subDomainModel) return null

    return new SubDomainBuilder()
      .withId(subDomainModel.id)
      .withDomainId(subDomainModel.domainId)
      .withName(subDomainModel.name)
      .withCreatedAt(subDomainModel.createdAt.toISO())
      .build()
  }

  static toDomainArray(subDomainModels: any[]): SubDomain[] {
    return subDomainModels
      .map((model) => this.toDomain(model))
      .filter((subDomain): subDomain is SubDomain => subDomain !== null)
  }
}
