import { Id } from '../../../../kernel/id.js'
import { SessionCollection } from '../../collections/SessionCollection.js'
import { Feature } from '../Feature.js'

export interface DeleteSessionInput {
  id: string
  userId: string
}

export class DeleteSessionFeature implements Feature<DeleteSessionInput, boolean> {
  constructor(private readonly sessionCollection: SessionCollection) {}

  async execute(input: DeleteSessionInput): Promise<boolean> {
    return await this.sessionCollection.delete(new Id(input.userId), new Id(input.id))
  }
}
