import { DateTime } from '../../../../kernel/datetime.js'
import { Id } from '../../../../kernel/id.js'
import { SessionCollection } from '../../collections/SessionCollection.js'
import { Session } from '../../entities/session/Session.js'
import { Feature } from '../Feature.js'

export interface GetSessionsByDateInput {
  date: string
  userId: string
}

export class GetSessionsByDateFeature implements Feature<GetSessionsByDateInput, Session[]> {
  constructor(private readonly sessionCollection: SessionCollection) {}

  async execute(input: GetSessionsByDateInput): Promise<Session[]> {
    // Parse date using DateTime for better timezone handling
    const inputDate = DateTime.fromISOString(input.date + 'T00:00:00.000Z')
    const startOfDay = inputDate.startOfDay()
    const endOfDay = inputDate.endOfDay()

    return await this.sessionCollection.getAllBetweenDates(
      new Id(input.userId),
      startOfDay,
      endOfDay
    )
  }
}
