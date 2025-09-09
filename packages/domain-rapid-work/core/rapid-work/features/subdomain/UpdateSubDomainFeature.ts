import { Id } from "../../../../kernel/id";
import { SubDomainCollection } from "../../collections/SubDomainCollection";
import { SubDomain } from "../../entities/subdomain/SubDomain";
import { SubDomainBuilder } from "../../entities/subdomain/SubDomainBuilder";
import { SubDomainNotFoundError } from "../../errors/DomainError";
import { Feature } from "../Feature";


export interface UpdateSubDomainParams {
    name: string;
    subDomainId: string;
    userId: string;
}

/**
 * Update a sub-domain
 * @param subDomainId - The ID of the sub-domain to update
 * @param name - The new name of the sub-domain
 * @returns The updated sub-domain
 */
export class UpdateSubDomainFeature implements Feature<UpdateSubDomainParams, SubDomain> {


    constructor(private subDomainCollection: SubDomainCollection) {}

    async execute(params: UpdateSubDomainParams) {
        const userIdVO = new Id(params.userId);
        const subDomain = await this.subDomainCollection.getById(userIdVO, new Id(params.subDomainId));
        if (!subDomain) {
            throw new SubDomainNotFoundError(params.subDomainId);
        }

        const updatedSubDomain = new SubDomainBuilder()
            .withId(subDomain.id.value)
            .withDomainId(subDomain.domainId.value)
            .withName(params.name)
            .build();

        await this.subDomainCollection.update(userIdVO, updatedSubDomain);

        return updatedSubDomain
    }
}