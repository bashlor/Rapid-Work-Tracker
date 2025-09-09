import { Id } from "../../../../kernel/id";
import { DomainCollection } from "../../collections/DomainCollection";
import { SubDomainCollection } from "../../collections/SubDomainCollection";
import { SubDomain } from "../../entities/subdomain/SubDomain";
import { SubDomainBuilder } from "../../entities/subdomain/SubDomainBuilder";
import {
  DomainNotFoundError,
  InvalidSubDomainWithoutDomainError,
} from "../../errors/DomainError";
import { Feature } from "../Feature";

export interface CreateSubDomainParams {
  domainId: string;
  name: string;
  userId: string;
}

/**
 * Create a sub-domain
 * @param domainId - The ID of the domain
 * @param name - The name of the sub-domain
 * @returns The created sub-domain
 */
export class CreateSubDomainFeature
  implements Feature<CreateSubDomainParams, SubDomain>
{
  private domainCollection: DomainCollection;
  private subDomainCollection: SubDomainCollection;

  constructor(
    subDomainCollection: SubDomainCollection,
    domainCollection: DomainCollection,
  ) {
    this.subDomainCollection = subDomainCollection;
    this.domainCollection = domainCollection;
  }

  async execute(params: CreateSubDomainParams): Promise<SubDomain> {
    const { domainId, name } = params;

    if (!domainId) {
      throw new InvalidSubDomainWithoutDomainError("No domain ID provided");
    }

    const userIdVo = new Id(params.userId);
    const domainIdVo = new Id(domainId);

    // Verify domain exists
    const domain = await this.domainCollection.getById(userIdVo,domainIdVo);
    if (!domain) {
      throw new DomainNotFoundError(domainId);
    }

    const subDomain = new SubDomainBuilder()
      .withDomainId(domainId)
      .withName(name)
      .build();

    const createdSubDomain = await this.subDomainCollection.insert(userIdVo, subDomain);

    return createdSubDomain;
  }
}
