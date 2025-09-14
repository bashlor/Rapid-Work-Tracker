import { DateTime } from '../../../../kernel/datetime.js'
import { Description } from '../../../../kernel/description.js'
import { Id } from '../../../../kernel/id.js'
import { SessionCollection } from '../../collections/SessionCollection.js'
import { Session } from '../../entities/session/Session.js'
import { Feature } from '../Feature.js'

export interface UpdateSessionInput {
  description?: string
  duration?: number
  endTime?: string
  id: string
  startTime?: string
  userId: string
}

export class UpdateSessionFeature implements Feature<UpdateSessionInput, Session> {
  constructor(private readonly sessionCollection: SessionCollection) {}

  async execute(input: UpdateSessionInput): Promise<Session> {
    const existingSession = await this.sessionCollection.getById(new Id(input.userId), new Id(input.id))
    if (!existingSession) {
      throw new Error('Session not found')
    }

    const newStart = input.startTime !== undefined
      ? new DateTime(input.startTime)
      : existingSession.getStartTime()

    const newEnd = input.endTime !== undefined
      ? new DateTime(input.endTime)
      : existingSession.getEndTime()

    const newDesc = input.description !== undefined
      ? new Description(input.description)
      : existingSession.getDescription()

    const updatedSession = Session.create(
      existingSession.getId(),
      existingSession.getTaskId(),
      existingSession.getUserId(),
      newStart,
      newEnd,
      newDesc,
      existingSession.getCreatedAt(),
      DateTime.now()
    )

    return await this.sessionCollection.update(updatedSession)
  }
}
