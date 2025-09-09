import { inject } from '@adonisjs/core'
import { UpdateMultipleSessionsFeature } from 'domain-rapid-work'

export interface UpdateMultipleSessionsInput {
  sessions: {
    description?: string
    duration?: number
    endTime: string
    id?: string
    startTime: string
    taskId: string
  }[]
  userId: string
}

@inject()
export class UpdateMultipleSessionsAction {
  constructor(private updateMultipleSessionsFeature: UpdateMultipleSessionsFeature) {}

  async execute(input: UpdateMultipleSessionsInput) {
    try {
      const response = await this.updateMultipleSessionsFeature.execute(input)

      return {
        publicHttpJsonResponse: {
          data: response.updatedSessions,
          message: `${response.updatedSessions.length} session(s) sauvegardée(s) avec succès`,
          success: true,
        },
      }
    } catch (error) {
      console.error('UpdateMultipleSessionsAction Error:', error)
      throw error
    }
  }
}
