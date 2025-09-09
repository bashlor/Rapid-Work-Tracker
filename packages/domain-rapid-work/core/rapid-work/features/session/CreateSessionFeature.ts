import { DomainError } from "../../../../error/domain_error";
import { DateTime } from "../../../../kernel/datetime";
import { Description } from "../../../../kernel/description";
import { Id } from "../../../../kernel/id";
import { SessionCollection } from "../../collections/SessionCollection";
import { Session } from "../../entities/session/Session";
import { Feature } from "../Feature";

export interface CreateSessionInput {
  description: string;
  duration?: number; // in seconds - optional, for effective work time
  endTime: string; // ISO string - always required
  startTime: string; // ISO string
  taskId: string;
  userId: string;
}

export class CreateSessionFeature
  implements Feature<CreateSessionInput, Session>
{
  constructor(private readonly sessionCollection: SessionCollection) {}

  async execute(input: CreateSessionInput): Promise<Session> {
    // Validate input
    const taskId = new Id(input.taskId)
    const userId = new Id(input.userId)
    const startTime = DateTime.fromISOString(input.startTime)
    const endTime = DateTime.fromISOString(input.endTime)
    const description = new Description(input.description)

    // Validation: endTime must be after startTime
    if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
      throw new DomainError("End time must be after start time")
    }

    // Check for overlapping sessions
    const existingSessions = await this.sessionCollection.findByUserAndDateRange(
      userId,
      startTime,
      endTime
    )

    const newSession = Session.create(
      Id.generate(),
      taskId,
      userId,
      startTime,
      endTime,
      description
    )

    // Check for overlaps
    for (const existingSession of existingSessions) {
      if (newSession.overlaps(existingSession)) {
        throw new DomainError(
          `Session overlaps with existing session from ${existingSession.getStartTime().toISOString()} to ${existingSession.getEndTime().toISOString()}`
        )
      }
    }

    await this.sessionCollection.save(newSession)

    return newSession
  }
}
