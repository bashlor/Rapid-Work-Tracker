import { DomainNotFoundError, SubDomainBuilder, SubDomainCollection } from "../../..";
import { Id } from "../../../../kernel/id";
import { DomainCollection } from "../../collections/DomainCollection";
import { Domain } from "../../entities/domain/Domain";
import { DomainBuilder } from "../../entities/domain/DomainBuilder";
import { Feature } from "../Feature";

export interface EditDomainParams {
  domainId: string
  name: string
  subDomains: SubDomainTypeParam[]
  userId: string;
}

type SubDomainTypeParam = {
    domainId: string;
    name: string;
  }

/**
 * Edit a domain with its sub-domains
 * @param domainId - The ID of the domain to edit
 * @param name - The new name of the domain
 * @param subDomains - The new sub-domains of the domain
 * @returns The updated domain
 */
export class EditDomainFeature implements Feature<EditDomainParams, Domain> {
  constructor(private domainCollection: DomainCollection, private subDomainCollection: SubDomainCollection) {}

  async execute(params: EditDomainParams): Promise<Domain> {
    const { domainId, name, subDomains: subDomainsRaw , userId } = params

    const userIdObj = new Id(userId)

    const subDomains = subDomainsRaw.map((subDomain) => new SubDomainBuilder()
      .withDomainId(subDomain.domainId)
      .withName(subDomain.name)
      .build());

    const foundDomain = await this.domainCollection.getById(userIdObj, new Id(domainId))

    if (!foundDomain) {
      throw new DomainNotFoundError(domainId)
    }

    const updatedDomain = DomainBuilder.fromDomain(foundDomain)
      .withName(name)
      .withSubDomains(subDomains)
      .build()

     await this.domainCollection.update(updatedDomain)
     await this.subDomainCollection.updateMany(userIdObj, subDomains)

     return updatedDomain
  }
}