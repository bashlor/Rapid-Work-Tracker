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
  TaskNotFoundError 
} from "../../errors/DomainError";
import { Feature } from "../Feature";

export interface UpdateTaskParams {
  description?: string;
  domainId?: string;
  status: TaskStatus;
  subDomainId?: string;
  taskId: string;
  title: string;
  userId: string;
}

/**
 * Update a task
 * @param taskId - The ID of the task to update
 * @param userId - The ID of the user
 * @param title - The new title of the task
 * @param description - The new description of the task
 * @param domainId - The new domain ID of the task
 * @param subDomainId - The new subdomain ID of the task
 * @param status - The new status of the task
 * @returns The updated task
 */
export class UpdateTaskFeature implements Feature<UpdateTaskParams, Task> {
  constructor(
    private taskCollection: TaskCollection,
    private domainCollection: DomainCollection,
    private subDomainCollection: SubDomainCollection
  ) {}

  async execute(params: UpdateTaskParams): Promise<Task> {
    const { description, domainId, status, subDomainId, taskId, title, userId } = params;
    
    const userIdVO = new Id(userId);
    const taskIdVO = new Id(taskId);
    
    // Check if task exists
    const existingTask = await this.taskCollection.getById(userIdVO, taskIdVO);
    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }
    
    // Validate that task has at least a domain or subdomain
    if (!domainId && !subDomainId) {
      throw new TaskMustBeLinkedToDomainOrSubDomainError();
    }
    
    let taskDomainId = domainId;
    
    // Validate domain exists if provided
    if (domainId) {
      const domainIdVO = new Id(domainId);
      const domain = await this.domainCollection.getById(userIdVO, domainIdVO);
      if (!domain) {
        throw new DomainNotFoundError(domainId);
      }
    }
    
    // Validate subdomain exists if provided
    if (subDomainId) {
      const subDomainIdVO = new Id(subDomainId);
      const subDomain = await this.subDomainCollection.getById(userIdVO, subDomainIdVO);
      if (!subDomain) {
        throw new SubDomainNotFoundError(subDomainId);
      }
      
      // If only subdomain is provided, automatically set the domain from the subdomain
      if (!taskDomainId) {
        taskDomainId = subDomain.domainId.value;
      }
    }
    
    // Build updated task
    const updatedTask = new TaskBuilder()
      .withId(taskId)
      .withUserId(userId)
      .withTitle(title)
      .withDescription(description ?? "")
      .withDomainId(taskDomainId || null)
      .withSubDomainId(subDomainId || null)
      .withStatus(status)
      .build();
    
    // Update task in collection
    await this.taskCollection.update(updatedTask);
    
    return updatedTask;
  }
}
