import { Id } from "../../../../kernel/id";
import { TaskCollection } from "../../collections/TaskCollection";
import { Task } from "../../entities/task/Task";
import { Feature } from "../Feature";


export type GetTasksParams = {
  domainId: string;
  userId: string;
} | {
  subDomainId: string;
  userId: string;
}
| {
  userId: string;
}


export class GetTasksFeature implements Feature<GetTasksParams, Task[]> {
  constructor(private readonly taskCollection: TaskCollection) {}

  async execute(params: GetTasksParams): Promise<Task[]> {
    const userId = new Id(params.userId);

    if ("subDomainId" in params) {
      const subDomainId = new Id(params.subDomainId);
      return this.taskCollection.getAllBySubDomainId(userId, subDomainId);
    }

    if ("domainId" in params) {
      const domainId = new Id(params.domainId);
      return this.taskCollection.getAllByDomainId(userId, domainId);
    }

    return this.taskCollection.getAllByUserId(userId);
  }
}
