import { v7 } from "uuid";

import { DateTime } from "../../../../kernel/datetime";
import { Description as DescVO } from "../../../../kernel/description";
import { Duration } from "../../../../kernel/duration";
import { Id } from "../../../../kernel/id";
import { Session } from "./Session";

export class SessionBuilder {
  private description?: DescVO;
  private duration: Duration;
  private endTime: DateTime;
  private id: Id;
  private startTime: DateTime;
  private taskId: Id | null = null;
  private userId: Id | null = null;

  constructor() {
    this.id = new Id(v7());
    this.startTime = DateTime.now();
    this.endTime =  DateTime.now();
    this.duration = new Duration(0);
  }

  public build(): Session {
    if (!this.userId) {
      throw new Error("UserId is required");
    }
    if (!this.taskId) {
      throw new Error("TaskId is required");
    }
    return Session.create(
      this.id,
      this.taskId,
      this.userId,
      this.startTime,
      this.endTime,
      this.description || new DescVO("")
    );
  }

  public generateId(): SessionBuilder {
    this.id = new Id(v7());
    return this;
  }

  public withDescription(description: string): SessionBuilder {
    this.description = new DescVO(description);
    return this;
  }

  public withDuration(duration: Duration | null | number): SessionBuilder {
    if (duration instanceof Duration) {
      this.duration = duration;
    } else if (typeof duration === "number" && duration !== null) {
      this.duration = new Duration(duration);
    } else {
      this.duration = new Duration(0);
    }
    return this;
  }

  public withEndTime(endTime: Date | string): SessionBuilder {
    this.endTime = new DateTime(endTime);
    if (this.endTime) {
      this.duration = new Duration(
        this.endTime.getTime() - this.startTime.getTime(),
      );
    } else {
      this.duration = new Duration(0);
    }
    return this;
  }

  public withId(id: string): SessionBuilder {
    this.id = new Id(id);
    return this;
  }

  public withStartTime(startTime: Date | string): SessionBuilder {
    this.startTime = new DateTime(startTime);
    return this;
  }

  public withTaskId(taskId: string): SessionBuilder {
    this.taskId = new Id(taskId);
    return this;
  }

  public withUserId(userId: string): SessionBuilder {
    this.userId = new Id(userId);
    return this;
  }
}
