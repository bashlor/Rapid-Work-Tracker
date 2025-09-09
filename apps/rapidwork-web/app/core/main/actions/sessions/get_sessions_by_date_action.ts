import { inject } from '@adonisjs/core'
import { GetSessionsByDateFeature } from 'domain-rapid-work'

import { GetSessionsByDateViewModel } from '../../view_models/sessions/get_sessions_by_date_view_model.js'

export interface GetSessionsByDateParams {
  date: string
  userId: string
}

@inject()
export class GetSessionsByDateAction {
  constructor(private getSessionsByDateFeature: GetSessionsByDateFeature) {}

  async execute({ date, userId }: GetSessionsByDateParams) {
    const sessions = await this.getSessionsByDateFeature.execute({ date, userId })
    const viewModel = new GetSessionsByDateViewModel({ date, userId }, sessions)
    return viewModel
  }
}
