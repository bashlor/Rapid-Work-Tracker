import { Id } from "../../../kernel/id";
import { Task } from "../entities/task/Task";

export abstract class TaskCollection {
  abstract delete(userId: Id, id: Id): Promise<boolean>;
  abstract getAllByDomainId(userId: Id, domainId: Id): Promise<Task[]>;
  abstract getAllBySubDomainId(userId: Id, subDomainId: Id): Promise<Task[]>;
  abstract getAllByUserId(userId: Id): Promise<Task[]>;
  abstract getById(userId: Id, id: Id): Promise<null | Task>;
  abstract insert(task: Task): Promise<Task>;
  abstract update(task: Task): Promise<Task>;
}
