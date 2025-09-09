import { Session, SessionBuilder } from 'domain-rapid-work'

export class SessionMapper {
  static fromDomain(session: Session): any {
    return {
      description: session.getDescription().value,
      duration: Math.round(session.getDuration().getSeconds()), // Convert to integer seconds
      endTime: session.getEndTime().toISOString(),
      id: session.getId().value,
      startTime: session.getStartTime().toISOString(),
      taskId: session.getTaskId().value,
      userId: session.getUserId().value,
    }
  }

  static toDomain(sessionModel: any): null | Session {
    if (!sessionModel) return null

    // Passer directement les chaînes ISO au SessionBuilder
    // qui se chargera de les convertir en DateTime domain
    return new SessionBuilder()
      .withId(sessionModel.id)
      .withUserId(sessionModel.userId)
      .withTaskId(sessionModel.taskId)
      .withStartTime(sessionModel.startTime)
      .withEndTime(sessionModel.endTime || sessionModel.startTime)
      .withDuration(sessionModel.duration || null)
      .withDescription(sessionModel.description || '')
      .build()
  }

  static toDomainArray(sessionModels: any[]): Session[] {
    return sessionModels
      .map((model) => this.toDomain(model))
      .filter((session): session is Session => session !== null)
  }
}
