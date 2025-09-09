import { Id } from "../../../kernel/id";
import { SubDomain } from "../entities/subdomain/SubDomain";

export abstract class SubDomainCollection {
  abstract delete(userId: Id, id: Id): Promise<boolean>;
  abstract getAllByDomainId(userId: Id, domainId: Id): Promise<SubDomain[]>;
  abstract getById(userId: Id, id: Id): Promise<null | SubDomain>;
  abstract insert(userId: Id, subDomain: SubDomain): Promise<SubDomain>;
  abstract insertMany(userId: Id, subDomains: SubDomain[]): Promise<SubDomain[]>;
  abstract update(userId: Id, subDomain: SubDomain): Promise<SubDomain>;
  abstract updateMany(userId: Id, subDomains: SubDomain[]): Promise<SubDomain[]>;
}
