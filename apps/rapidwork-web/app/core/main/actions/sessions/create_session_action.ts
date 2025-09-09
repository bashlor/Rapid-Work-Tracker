import { inject } from '@adonisjs/core'
import { CreateSessionFeature } from 'domain-rapid-work'

import { CreateSessionViewModel } from '../../view_models/sessions/create_session_view_model.js'

export interface CreateSessionData {
  description?: string
  duration?: number // in seconds - optional, for effective work time
  endTime: string // Always required
  startTime: string
  taskId: string
}

@inject()
export class CreateSessionAction {
  constructor(private createSessionFeature: CreateSessionFeature) {}

  async execute(userId: string, data: CreateSessionData) {
    const session = await this.createSessionFeature.execute({
      description: data.description || '',
      duration: data.duration,
      endTime: data.endTime,
      startTime: data.startTime,
      taskId: data.taskId,
      userId,
    })
    return new CreateSessionViewModel(
      {
        description: data.description,
        duration: data.duration,
        endTime: data.endTime,
        startTime: data.startTime,
        taskId: data.taskId,
        userId,
      },
      session
    )
  }
}
