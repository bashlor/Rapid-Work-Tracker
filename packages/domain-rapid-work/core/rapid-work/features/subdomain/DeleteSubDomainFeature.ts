import { Id } from "../../../../kernel/id";
import { SubDomainCollection } from "../../collections/SubDomainCollection";
import { TaskCollection } from "../../collections/TaskCollection";
import { SubDomain } from "../../entities/subdomain/SubDomain";
import { CannotDeleteSubDomainWithTasksError, SubDomainNotFoundError } from "../../errors/DomainError";
import { Feature } from "../Feature";

export interface DeleteSubDomainParams {
  subDomainId: string;
  userId: string;
}

/**
 * Delete a sub-domain
 * @param subDomainId - The ID of the sub-domain to delete
 * @returns The deleted sub-domain
 */
export class DeleteSubDomainFeature implements Feature<DeleteSubDomainParams, SubDomain> {

    constructor(private subDomainCollection: SubDomainCollection, private taskCollection: TaskCollection) {}

    async execute(params: DeleteSubDomainParams) {
        const userIdVO = new Id(params.userId);
        const subDomainIdVO = new Id(params.subDomainId);

        const subDomain = await this.subDomainCollection.getById(userIdVO, subDomainIdVO);
        if (!subDomain) {
            throw new SubDomainNotFoundError(params.subDomainId);
        }

        const hasTasks = await this.taskCollection.getAllBySubDomainId(userIdVO, subDomainIdVO);
        if (hasTasks.length > 0) {
            throw new CannotDeleteSubDomainWithTasksError({subDomainId: params.subDomainId});
        }

        await this.subDomainCollection.delete(userIdVO, subDomainIdVO);

        return subDomain
    }
}