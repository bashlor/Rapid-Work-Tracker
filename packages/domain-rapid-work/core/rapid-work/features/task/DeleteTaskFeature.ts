import { Id } from "../../../../kernel/id";
import { TaskCollection } from "../../collections/TaskCollection";
import { TaskNotFoundError } from "../../errors/DomainError";
import { Feature } from "../Feature";

export interface DeleteTaskParams {
  taskId: string;
  userId: string;
}

/**
 * Delete a task
 * @param taskId - The ID of the task to delete
 * @param userId - The ID of the user
 * @returns true if the task was deleted successfully
 */
export class DeleteTaskFeature implements Feature<DeleteTaskParams, boolean> {
  constructor(private taskCollection: TaskCollection) {}

  async execute(params: DeleteTaskParams): Promise<boolean> {
    const { taskId, userId } = params;
    
    const userIdVO = new Id(userId);
    const taskIdVO = new Id(taskId);
    
    // Check if task exists
    const existingTask = await this.taskCollection.getById(userIdVO, taskIdVO);
    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }
    
    // Delete the task
    const result = await this.taskCollection.delete(userIdVO, taskIdVO);
    
    return result;
  }
}
