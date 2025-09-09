import { inject } from '@adonisjs/core'
import { DeleteSessionFeature } from 'domain-rapid-work'

import { DeleteSessionViewModel } from '../../view_models/sessions/delete_session_view_model.js'

interface DeleteSessionParams {
  id: string
  userId: string
}

@inject()
export class DeleteSessionAction {
  constructor(private deleteSessionFeature: DeleteSessionFeature) {}

  async execute({ id, userId }: DeleteSessionParams) {
    const success = await this.deleteSessionFeature.execute({ id, userId })
    return new DeleteSessionViewModel({ id, userId }, success)
  }
}
