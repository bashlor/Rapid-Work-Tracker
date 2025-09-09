import { DateTime } from "../../../kernel/datetime";
import { Id } from "../../../kernel/id";
import { Session } from "../entities/session/Session";

export abstract class SessionCollection {
  abstract delete(userId: Id, id: Id): Promise<boolean>;
  abstract findByUserAndDateRange(userId: Id, startDate: DateTime, endDate: DateTime): Promise<Session[]>;
  abstract findOverlappingSessions(
    userId: Id, 
    startTime: DateTime, 
    endTime: DateTime, 
    excludeSessionId?: Id
  ): Promise<Session[]>;
  abstract getAllBetweenDates(
    userId: Id,
    startDate: DateTime,
    endDate: DateTime,
  ): Promise<Session[]>;
  abstract getAllByTaskId(userId: Id, taskId: Id): Promise<Session[]>;
  abstract getAllByUserId(userId: Id): Promise<Session[]>;
  abstract getById(userId: Id, id: Id): Promise<null | Session>;
  abstract save(session: Session): Promise<void>;
  abstract update(session: Session): Promise<Session>;
  abstract updateMultiple(sessions: Session[]): Promise<void>;
}
