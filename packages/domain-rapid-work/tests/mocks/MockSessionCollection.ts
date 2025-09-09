import { SessionCollection } from "../../core/rapid-work/collections/SessionCollection";
import { Session } from "../../core/rapid-work/entities/session/Session";
import { DateTime } from "../../kernel/datetime";
import { Id } from "../../kernel/id";

export class MockSessionCollection extends SessionCollection {
  private sessions: Session[] = [];

  // Helper methods for testing
  clear(): void {
    this.sessions = [];
  }

  async delete(userId: Id, id: Id): Promise<boolean> {
    const index = this.sessions.findIndex((s) => s.getId().value === id.value && s.getUserId().value === userId.value);
    if (index === -1) {
      return false;
    }
    this.sessions.splice(index, 1);
    return true;
  }

  async findById(id: Id): Promise<null | Session> {
    return this.sessions.find((s) => s.getId().value === id.value) || null;
  }

  async findByUserAndDateRange(userId: Id, startDate: DateTime, endDate: DateTime): Promise<Session[]> {
    return this.sessions.filter((s) => {
      const sessionStart = s.getStartTime();
      const sessionEnd = s.getEndTime();
      
      return s.getUserId().value === userId.value &&
        ((sessionStart.isAfter(startDate) || sessionStart.equals(startDate)) &&
         (sessionEnd.isBefore(endDate) || sessionEnd.equals(endDate)) ||
         // Check for overlaps
         (sessionStart.isBefore(endDate) && sessionEnd.isAfter(startDate)));
    });
  }

  async findByUserAndDay(userId: Id, date: DateTime): Promise<Session[]> {
    return this.sessions.filter((s) => {
      return s.getUserId().value === userId.value && s.getStartTime().isSameDay(date);
    });
  }

  async findOverlappingSessions(userId: Id, startTime: DateTime, endTime: DateTime, excludeSessionId?: Id): Promise<Session[]> {
    return this.sessions.filter((s) => {
      if (excludeSessionId && s.getId().value === excludeSessionId.value) {
        return false;
      }
      
      return s.getUserId().value === userId.value &&
        s.getStartTime().isBefore(endTime) &&
        s.getEndTime().isAfter(startTime);
    });
  }

  getAll(): Session[] {
    return [...this.sessions];
  }

  async getAllBetweenDates(userId: Id, startDate: DateTime, endDate: DateTime): Promise<Session[]> {
    return this.sessions.filter((s) => {
      const sessionStart = s.getStartTime();
      const sessionEnd = s.getEndTime();
      return sessionStart.isAfter(startDate) && sessionEnd.isBefore(endDate) 
        && s.getUserId().value === userId.value;
    });
  }

  async getAllByTaskId(userId: Id, taskId: Id): Promise<Session[]> {
    return this.sessions.filter((s) => s.getTaskId().value === taskId.value && s.getUserId().value === userId.value);
  }

  async getAllByUserId(userId: Id): Promise<Session[]> {
    return this.sessions.filter((s) => s.getUserId().value === userId.value);
  }

  async getById(userId: Id, id: Id): Promise<null | Session> {
    return this.sessions.find((s) => s.getId().value === id.value && s.getUserId().value === userId.value) || null;
  }

  async getSessions(): Promise<Session[]> {
    return [...this.sessions];
  }

  async insert(session: Session): Promise<Session> {
    this.sessions.push(session);
    return session;
  }

  // Nouvelles méthodes requises par SessionCollection
  async save(session: Session): Promise<void> {
    const existingIndex = this.sessions.findIndex(
      (s) => s.getId().value === session.getId().value
    );
    
    if (existingIndex !== -1) {
      this.sessions[existingIndex] = session;
    } else {
      this.sessions.push(session);
    }
  }

  async update(session: Session): Promise<Session> {
    const index = this.sessions.findIndex(
      (s) => s.getId().value === session.getId().value,
    );
    if (index === -1) {
      throw new Error("Session not found");
    }
    this.sessions[index] = session;
    return session;
  }

  async updateMultiple(sessions: Session[]): Promise<void> {
    for (const session of sessions) {
      await this.update(session);
    }
  }

  async upsertManySessions(sessions: Session[]): Promise<Session[]> {
    const upsertedSessions: Session[] = [];
    
    for (const session of sessions) {
      const existingIndex = this.sessions.findIndex(
        (s) => s.getId().value === session.getId().value && s.getUserId().value === session.getUserId().value
      );
      
      if (existingIndex !== -1) {
        // Mettre à jour la session existante
        this.sessions[existingIndex] = session;
        upsertedSessions.push(session);
      } else {
        // Insérer une nouvelle session
        this.sessions.push(session);
        upsertedSessions.push(session);
      }
    }
    
    return upsertedSessions;
  }
}