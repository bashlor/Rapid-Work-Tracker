import { DateTime } from "../../../../kernel/datetime";
import { Description as DescVO } from "../../../../kernel/description";
import { Id } from "../../../../kernel/id";
import { Label } from "../../../../kernel/label";
import {
  TaskMustBeLinkedToDomainOrSubDomainError,
} from "../../errors/DomainError";
import { TaskStatus, TaskStatusValueType } from "./TaskStatus";

export interface TaskData {
  createdAt: string;
  description?: string;
  domainId: null | string;
  id: string;
  status: TaskStatusValueType;
  subDomainId: null | string;
  title: string;
  userId: string;
}

export class Task {
  constructor(
    public readonly id: Id,
    public readonly userId: Id,
    public readonly title: Label,
    public readonly description: DescVO,
    public readonly domainId: Id | null,
    public readonly subDomainId: Id | null,
    public readonly status: TaskStatus,
    public readonly createdAt: DateTime,
  ) {}
}

export function fromTaskData(data: TaskData): Task {
  return new Task(
    new Id(data.id),
    new Id(data.userId),
    new Label(data.title),
    new DescVO(data.description ?? ""),
    data.domainId ? new Id(data.domainId) : null,
    data.subDomainId ? new Id(data.subDomainId) : null,
    TaskStatus.create(data.status),
    new DateTime(data.createdAt),
  );
}

// Keep the old function for backward compatibility
export function isTaskValid(task: Task): boolean {
  try {
    validateTask(task);
    return true;
  } catch {
    return false;
  }
}

export function toTaskData(task: Task): TaskData {
  return {
    createdAt: task.createdAt.toISOString(),
    description: task.description.value,
    domainId: task.domainId ? task.domainId.value : null,
    id: task.id.value,
    status: task.status.value,
    subDomainId: task.subDomainId ? task.subDomainId.value : null,
    title: task.title.value,
    userId: task.userId.value,
  };
}

export function validateTask(task: Task): void {
  // A task must have either a domain or a subdomain
  if (task.domainId === null && task.subDomainId === null) {
    throw new TaskMustBeLinkedToDomainOrSubDomainError();
  }
}
