import { Id } from "../../../../kernel/id";
import { DomainCollection } from "../../collections/DomainCollection";
import { SubDomainCollection } from "../../collections/SubDomainCollection";
import { TaskCollection } from "../../collections/TaskCollection";
import { Task } from "../../entities/task/Task";
import { TaskBuilder } from "../../entities/task/TaskBuilder";
import { TaskStatus } from "../../entities/task/TaskStatus";
import {
  DomainNotFoundError,
  SubDomainNotFoundError,
  TaskMustBeLinkedToDomainOrSubDomainError,
} from "../../errors/DomainError";
import { Feature } from "../Feature";

export interface CreateTaskParams {
  description?: string;
  domainId?: string;
  status: TaskStatus;
  subDomainId?: string;
  title: string;
  userId: string;
}

export class CreateTaskFeature implements Feature<CreateTaskParams, Task> {
  private domainCollection: DomainCollection;
  private subDomainCollection: SubDomainCollection;
  private taskCollection: TaskCollection;

  constructor(
    taskCollection: TaskCollection,
    domainCollection: DomainCollection,
    subDomainCollection: SubDomainCollection,
  ) {
    this.taskCollection = taskCollection;
    this.domainCollection = domainCollection;
    this.subDomainCollection = subDomainCollection;
  }

  async execute(params: CreateTaskParams): Promise<Task> {
    const { description, domainId, status, subDomainId, title, userId } = params;

    const userIdVo = new Id(userId);

    if (!domainId && !subDomainId) {
      throw new TaskMustBeLinkedToDomainOrSubDomainError();
    }

    let taskDomainId = domainId;
    
    if (domainId) {
      const domainIdVo = new Id(domainId);
      const domain = await this.domainCollection.getById(userIdVo, domainIdVo);
      if (!domain) throw new DomainNotFoundError(domainId);
    }
    if (subDomainId) {
      const subDomainIdVo = new Id(subDomainId);
      const subDomain = await this.subDomainCollection.getById(userIdVo, subDomainIdVo);
      if (!subDomain) throw new SubDomainNotFoundError(subDomainId);
      
      // If only subdomain is provided, automatically set the domain from the subdomain
      if (!taskDomainId) {
        taskDomainId = subDomain.domainId.value;
      }
    }
    
    const task = new TaskBuilder()
      .withUserId(userId)
      .withTitle(title)
      .withDescription(description ?? "")
      .withDomainId(taskDomainId || null)
      .withSubDomainId(subDomainId || null)
      .withStatus(status)
      .build();
    return this.taskCollection.insert(task);
  }
}
