import type { Session as SessionEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

import { SessionMapper } from '../../mappers/session_mapper.js'

interface GetSessionsByDateInput {
  date: string
  userId: string
}

export class GetSessionsByDateViewModel extends ViewModelActionResponse<
  GetSessionsByDateInput,
  SessionEntity[]
> {
  publicHttpJsonResponse(timezone: string) {
    return this.entities.map((s) => SessionMapper.fromDomain(s, timezone))
  }
}
