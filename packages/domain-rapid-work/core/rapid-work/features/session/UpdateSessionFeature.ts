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
  userId: string
}

export class UpdateSessionFeature implements Feature<UpdateSessionInput, Session> {
  constructor(private readonly sessionCollection: SessionCollection) {}

  async execute(input: UpdateSessionInput): Promise<Session> {
    const existingSession = await this.sessionCollection.getById(new Id(input.userId), new Id(input.id))
    if (!existingSession) {
      throw new Error('Session not found')
    }

    // Créer une nouvelle session avec les modifications en utilisant les bonnes méthodes
    let updatedSession = existingSession

    if (input.endTime !== undefined) {
      updatedSession = updatedSession.updateEndTime(new DateTime(input.endTime))
    }

    if (input.description !== undefined) {
      updatedSession = updatedSession.updateDescription(new Description(input.description))
    }

    // Note: duration est maintenant calculée automatiquement à partir de startTime et endTime
    // donc on n'a plus besoin de la gérer explicitement

    return await this.sessionCollection.update(updatedSession)
  }
}
