import { DomainError } from '../../../../error/domain_error'
import { DateTime } from '../../../../kernel/datetime'
import { Description } from '../../../../kernel/description'
import { Id } from '../../../../kernel/id'
import { SessionCollection } from '../../collections/SessionCollection'
import { Session } from '../../entities/session/Session'
import { Feature } from '../Feature'

export interface UpdateMultipleSessionsInput {
  sessions: {
    description?: string
    endTime: string
    id?: string // Optionnel pour les nouvelles sessions
    startTime: string
    taskId: string
  }[]
  userId: string
}

export interface UpdateMultipleSessionsResponse {
  updatedSessions: Array<{
    duration: number
    endTime: string
    id: string
    startTime: string
  }>
}

export class UpdateMultipleSessionsFeature implements Feature<UpdateMultipleSessionsInput, UpdateMultipleSessionsResponse> {
  constructor(private readonly sessionCollection: SessionCollection) {}

  async execute(input: UpdateMultipleSessionsInput): Promise<UpdateMultipleSessionsResponse> {
    const userId = new Id(input.userId)
    const updatedSessions: Session[] = []

    // Validate all sessions first
    for (const sessionData of input.sessions) {
      const id = sessionData.id ? new Id(sessionData.id) : Id.generate()
      const taskId = new Id(sessionData.taskId)
      const startTime = DateTime.fromISOString(sessionData.startTime)
      const endTime = DateTime.fromISOString(sessionData.endTime)
      const description = new Description(sessionData.description || "")

      const session = Session.create(id, taskId, userId, startTime, endTime, description)
      updatedSessions.push(session)
    }

    // Check for overlapping sessions
    for (let i = 0; i < updatedSessions.length; i++) {
      for (let j = i + 1; j < updatedSessions.length; j++) {
        if (updatedSessions[i].overlaps(updatedSessions[j])) {
          throw new DomainError(
            `Sessions ${updatedSessions[i].getId().value} and ${updatedSessions[j].getId().value} overlap`
          )
        }
      }
    }

    // Save all sessions
    await this.sessionCollection.updateMultiple(updatedSessions)

    return {
      updatedSessions: updatedSessions.map(session => ({
        duration: session.getDuration().getMinutes(),
        endTime: session.getEndTime().toISOString(),
        id: session.getId().value,
        startTime: session.getStartTime().toISOString()
      }))
    }
  }
}
