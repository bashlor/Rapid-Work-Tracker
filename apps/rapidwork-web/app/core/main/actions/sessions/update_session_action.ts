import { inject } from '@adonisjs/core'
import { UpdateSessionFeature } from 'domain-rapid-work'

import { UpdateSessionViewModel } from '../../view_models/sessions/update_session_view_model.js'

export interface UpdateSessionData {
  description?: string
  duration?: number
  endTime?: string
}

@inject()
export class UpdateSessionAction {
  constructor(private updateSessionFeature: UpdateSessionFeature) {}

  async execute(userId: string, sessionId: string, data: UpdateSessionData) {
    const session = await this.updateSessionFeature.execute({
      description: data.description,
      duration: data.duration,
      endTime: data.endTime,
      id: sessionId,
      userId,
    })
    return new UpdateSessionViewModel(
      {
        description: data.description,
        duration: data.duration,
        endTime: data.endTime,
        id: sessionId,
        userId,
      },
      session
    )
  }
}
