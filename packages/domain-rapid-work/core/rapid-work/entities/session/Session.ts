import { DomainError } from "../../../../error/domain_error";
import { DateTime } from "../../../../kernel/datetime";
import { Description as DescVO } from "../../../../kernel/description";
import { Duration } from "../../../../kernel/duration";
import { Id } from "../../../../kernel/id";

export interface SessionData {
  createdAt?: string;
  description?: string;
  endTime: string;
  id: string;
  startTime: string;
  taskId: string;
  updatedAt?: string;
  userId: string;
}

export class Session {
  private constructor(
    private readonly id: Id,
    private readonly taskId: Id,
    private readonly userId: Id,
    private readonly startTime: DateTime,
    private readonly endTime: DateTime,
    private readonly description: DescVO,
    private readonly createdAt: DateTime,
    private readonly updatedAt: DateTime
  ) {
    this.validateTimeOrder()
    this.validateDuration()
  }

  static create(
    id: Id,
    taskId: Id,
    userId: Id,
    startTime: DateTime,
    endTime: DateTime,
    description: DescVO,
    createdAt?: DateTime,
    updatedAt?: DateTime
  ): Session {
    const now = DateTime.now()
    return new Session(
      id,
      taskId,
      userId,
      startTime,
      endTime,
      description,
      createdAt || now,
      updatedAt || now
    )
  }

  getCreatedAt(): DateTime { return this.createdAt }

  getDescription(): DescVO { return this.description }

  getDuration(): Duration {
    return Duration.fromDateRange(
      this.startTime.getValue(),
      this.endTime.getValue()
    )
  }

  getEndTime(): DateTime { return this.endTime }

  // Getters
  getId(): Id { return this.id }

  getStartTime(): DateTime { return this.startTime }

  getTaskId(): Id { return this.taskId }

  getUpdatedAt(): DateTime { return this.updatedAt }

  getUserId(): Id { return this.userId }

  isOnDate(date: DateTime): boolean {
    return this.startTime.isSameDay(date)
  }
  isOnSameDay(other: Session): boolean {
    return this.startTime.isSameDay(other.startTime)
  }
  // Legacy method for backward compatibility - use isOnDate instead
  isOnSameDay_Legacy(date: Date): boolean {
    const sessionDate = this.startTime.getValue()
    return sessionDate.getFullYear() === date.getFullYear() &&
           sessionDate.getMonth() === date.getMonth() &&
           sessionDate.getDate() === date.getDate()
  }
  overlaps(other: Session): boolean {
    // Sessions overlap if one starts before the other ends and vice versa
    return this.startTime.isBefore(other.endTime) && 
           other.startTime.isBefore(this.endTime)
  }
  updateDescription(description: DescVO): Session {
    return new Session(
      this.id,
      this.taskId,
      this.userId,
      this.startTime,
      this.endTime,
      description,
      this.createdAt,
      DateTime.now()
    )
  }
  updateEndTime(endTime: DateTime): Session {
    return new Session(
      this.id,
      this.taskId,
      this.userId,
      this.startTime,
      endTime,
      this.description,
      this.createdAt,
      DateTime.now()
    )
  }
  private validateDuration(): void {
    const duration = this.getDuration()
    
    // Minimum 1 minute
    if (duration.getMinutes() < 1) {
      throw new DomainError('Session duration must be at least 1 minute')
    }
    
    // Maximum 24 hours - but account for timezone changes
    // Use precise minutes comparison to avoid floating point issues
    const maxMinutes = 24 * 60
    if (duration.getMinutes() > maxMinutes) {
      throw new DomainError('Session duration cannot exceed 24 hours')
    }
  }
  private validateTimeOrder(): void {
    if (this.endTime.isBefore(this.startTime) || this.endTime.equals(this.startTime)) {
      throw new DomainError('Session end time must be after start time')
    }
  }
}

export function calculateSessionDuration(session: Session): number {
  return session.getDuration().getMinutes();
}

export function calculateSessionDurationInHours(session: Session): number {
  return session.getDuration().getHours();
}

export function formatSessionDuration(session: Session): string {
  return session.getDuration().toString();
}

export function formatSessionDurationDetailed(session: Session): string {
  return session.getDuration().toDetailedString();
}

export function isValidSessionTimeRange(startTime: DateTime, endTime: DateTime): boolean {
  try {
    const duration = Duration.fromDateRange(startTime.getValue(), endTime.getValue())
    return duration.getMinutes() >= 1 && duration.getMinutes() <= 24 * 60
  } catch {
    return false
  }
}

export function toSession(data: SessionData): Session {
  const now = DateTime.now()
  return Session.create(
    new Id(data.id),
    new Id(data.taskId),
    new Id(data.userId),
    new DateTime(data.startTime),
    new DateTime(data.endTime),
    data.description ? new DescVO(data.description) : new DescVO(""),
    data.createdAt ? new DateTime(data.createdAt) : now,
    data.updatedAt ? new DateTime(data.updatedAt) : now,
  )
}

export function toSessionData(session: Session): SessionData {
  return {
    createdAt: session.getCreatedAt().toISOString(),
    description: session.getDescription().value,
    endTime: session.getEndTime().toISOString(),
    id: session.getId().value,
    startTime: session.getStartTime().toISOString(),
    taskId: session.getTaskId().value,
    updatedAt: session.getUpdatedAt().toISOString(),
    userId: session.getUserId().value,
  };
}
