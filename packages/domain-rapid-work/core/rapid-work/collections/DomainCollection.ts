import { Id } from "../../../kernel/id";
import { Domain } from "../entities/domain/Domain";

export abstract class DomainCollection {
  abstract delete(userId: Id, id: Id): Promise<boolean>;
  abstract getAllByUserId(userId: Id): Promise<Domain[]>;
  abstract getById(userId: Id, id: Id): Promise<Domain | null>;
  abstract insert(domain: Domain): Promise<Domain>;
  abstract update(domain: Domain): Promise<Domain>;
}
