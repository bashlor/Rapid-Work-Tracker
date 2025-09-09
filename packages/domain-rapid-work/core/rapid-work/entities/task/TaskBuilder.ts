import { v7 } from "uuid";

import { DateTime } from "../../../../kernel/datetime";
import { Description as DescVO } from "../../../../kernel/description";
import { Id } from "../../../../kernel/id";
import { Label } from "../../../../kernel/label";
import { Task } from "./Task";
import { TaskStatus } from "./TaskStatus";

export class TaskBuilder {
  private createdAt: DateTime;
  private description: DescVO | null = null;
  private domainId: Id | null;
  private id: Id;
  private status: TaskStatus = TaskStatus.create("pending");
  private subDomainId: Id | null;
  private title: Label | null = null;
  private userId: Id | null = null;

  constructor() {
    this.id = new Id(v7());
    this.domainId = null;
    this.subDomainId = null;
    this.status = TaskStatus.create("pending");
    this.createdAt = DateTime.now();
  }

  public build(): Task {
    if (!this.userId) {
      throw new Error("UserId is required");
    }
    if (!this.title) {
      throw new Error("Title is required");
    }
    if (!this.description) {
      throw new Error("Description is required");
    }
    if (!this.domainId && !this.subDomainId) {
      throw new Error("Either DomainId or SubDomainId is required");
    }

    return new Task(
      this.id,
      this.userId,
      this.title,
      this.description,
      this.domainId,
      this.subDomainId,
      this.status,
      this.createdAt,
    );
  }

  public generateId(): TaskBuilder {
    this.id = new Id(v7());
    return this;
  }

  public withCreatedAt(createdAt: Date | string): TaskBuilder {
    this.createdAt = new DateTime(createdAt);
    return this;
  }

  public withDescription(description: string): TaskBuilder {
    this.description = new DescVO(description);
    return this;
  }

  public withDomainId(domainId: null | string): TaskBuilder {
    if (domainId && domainId.trim().length > 0) {
      this.domainId = new Id(domainId);
    } else {
      this.domainId = null;
    }
    return this;
  }

  public withId(id: string): TaskBuilder {
    this.id = new Id(id);
    return this;
  }

  public withStatus(status: TaskStatus): TaskBuilder {
    this.status = status;
    return this;
  }

  public withSubDomainId(subDomainId: null | string): TaskBuilder {
    if (subDomainId && subDomainId.trim().length > 0) {
      this.subDomainId = new Id(subDomainId);
    } else {
      this.subDomainId = null;
    }
    return this;
  }

  public withTitle(title: string): TaskBuilder {
    this.title = new Label(title);
    return this;
  }

  public withUserId(userId: string): TaskBuilder {
    this.userId = new Id(userId);
    return this;
  }
}
