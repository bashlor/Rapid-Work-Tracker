import { Id } from "../../../../kernel/id";
import { DomainCollection } from "../../collections/DomainCollection";
import { Domain } from "../../entities/domain/Domain";
import { Feature } from "../Feature";

export interface GetDomainsParams {
  userId: string;
}

/**
 * Get all domains for a user with their sub-domains
 * @param userId - The ID of the user
 * @returns A list of domains with their sub-domains
 */
export class GetDomainsFeature implements Feature<GetDomainsParams, Domain[]> {

  constructor(private domainCollection: DomainCollection) {}

  async execute(params: GetDomainsParams): Promise<Domain[]> {
    const { userId } = params;
    return this.domainCollection.getAllByUserId(new Id(userId));
  }
}
