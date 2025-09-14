import { Session, SessionBuilder } from 'domain-rapid-work'

export class SessionMapper {
  static fromDomain(session: Session, userTimezone = 'UTC') {
    return {
      description: session.getDescription().value,
      duration: Math.round(session.getDuration().getSeconds()), // Convert to integer seconds
      endTime: session.getEndTime().toTimezone(userTimezone).toISOString(),
      id: session.getId().value,
      startTime: session.getStartTime().toTimezone(userTimezone).toISOString(),
      taskId: session.getTaskId().value,
      userId: session.getUserId().value,
    }
  }

  static toDomain(sessionModel: any): null | Session {
    if (!sessionModel) return null

    return new SessionBuilder()
      .withId(sessionModel.id)
      .withUserId(sessionModel.userId)
      .withTaskId(sessionModel.taskId)
      .withStartTime(
        typeof sessionModel.startTime?.toISO === 'function'
          ? sessionModel.startTime.toISO()
          : sessionModel.startTime
      )
      .withEndTime(
        typeof sessionModel.endTime?.toISO === 'function'
          ? sessionModel.endTime.toISO()
          : sessionModel.endTime ||
              (typeof sessionModel.startTime?.toISO === 'function'
                ? sessionModel.startTime.toISO()
                : sessionModel.startTime)
      )
      .withDescription(sessionModel.description || '')
      .build()
  }

  static toDomainArray(sessionModels: any[]): Session[] {
    return sessionModels
      .map((model) => this.toDomain(model))
      .filter((session): session is Session => session !== null)
  }
}
