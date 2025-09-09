import { DomainCollection } from "../../collections/DomainCollection";
import { SubDomainCollection } from "../../collections/SubDomainCollection";
import { Domain } from "../../entities/domain/Domain";
import { DomainBuilder } from "../../entities/domain/DomainBuilder";
import { SubDomainBuilder } from "../../entities/subdomain/SubDomainBuilder";
import { Feature } from "../Feature";

export interface CreateDomainParams {
  name: string;
  subDomains: SubDomainTypeParam[];
  userId: string;
}

type SubDomainTypeParam = {
  domainId: string;
  name: string;
}

/**
 * Create a domain with its sub-domains
 * @param userId - The ID of the user
 * @param name - The name of the domain
 * @param subDomains - The sub-domains of the domain
 * @returns The created domain
 */
export class CreateDomainFeature
  implements Feature<CreateDomainParams, Domain>
{
  constructor(private domainCollection: DomainCollection, private subDomainCollection: SubDomainCollection) {}

  async execute(params: CreateDomainParams): Promise<Domain> {
    const { name, subDomains: subDomainsRaw, userId } = params;

    const subDomains = subDomainsRaw.map((subDomain) => new SubDomainBuilder()
      .withDomainId(subDomain.domainId)
      .withName(subDomain.name)
      .build());

    const domain = new DomainBuilder()
      .withUserId(userId)
      .withName(name)
      .withSubDomains(subDomains)
      .build();

  const createdDomain = await this.domainCollection.insert(domain)
  await this.subDomainCollection.insertMany(domain.userId, subDomains)

    return createdDomain;
  }
}
