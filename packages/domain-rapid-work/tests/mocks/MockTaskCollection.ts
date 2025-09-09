import { TaskCollection } from "../../core/rapid-work/collections/TaskCollection";
import { Task } from "../../core/rapid-work/entities/task/Task";
import { TaskStatus } from "../../core/rapid-work/entities/task/TaskStatus";
import { Id } from "../../kernel/id";
import { generateUUIDv7 } from "../helpers/uuid-helper";

export class MockTaskCollection extends TaskCollection {
  private tasks: Task[] = [];

  addMockTask(task: Task) {
    this.tasks.push(task);
  }

  // Helper methods for testing
  clear(): void {
    this.tasks = [];
  }

  async delete(userId: Id, id: Id): Promise<boolean> {
    const index = this.tasks.findIndex((t) => 
      t.id.value === id.value && t.userId.value === userId.value
    );
    if (index === -1) {
      return false;
    }
    this.tasks.splice(index, 1);
    return true;
  }

  // synchronous helper used by tests
  getAll(): Task[] {
    return [...this.tasks];
  }

  async getAllByDomainId(userId: Id, domainId: Id): Promise<Task[]> {
    return this.tasks.filter((t) => t.domainId?.value === domainId.value && t.userId.value === userId.value);
  }

  async getAllBySubDomainId(userId: Id, subDomainId: Id): Promise<Task[]> {
    return this.tasks.filter((t) => t.subDomainId?.value === subDomainId.value && t.userId.value === userId.value);
  }

  async getAllByUserId(userId: Id): Promise<Task[]> {
    return this.tasks.filter((t) => t.userId.value === userId.value);
  }

  async getById(userId: Id, id: Id): Promise<null | Task> {
    return this.tasks.find((t) => t.id.value === id.value && t.userId.value === userId.value) || null;
  }

  async getTasks(): Promise<Task[]> {
    return [...this.tasks];
  }

  async insert(task: Task): Promise<Task> {
    // Use the existing ID if present, otherwise generate a new one
    const id = task.id || new Id(generateUUIDv7());

    const insertedTask = new Task(
      id,
      task.userId,
      task.title,
      task.description,
      task.domainId,
      task.subDomainId,
      task.status || TaskStatus.create("pending"),
      task.createdAt,
    );

    this.tasks.push(insertedTask);
    return insertedTask;
  }

  async update(task: Task): Promise<Task> {
    const index = this.tasks.findIndex(
      (t) => t.id.value === task.id.value,
    );
    if (index === -1) {
      throw new Error("Task not found");
    }
    this.tasks[index] = task;
    return task;
  }
}
