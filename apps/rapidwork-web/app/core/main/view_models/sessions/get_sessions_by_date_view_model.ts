import type { Session as SessionEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

import { SessionHttpDto } from '../../../../dtos/session_dto.js'
import { SessionMapper } from '../../mappers/session_mapper.js'

interface GetSessionsByDateInput {
  date: string
  userId: string
}

export class GetSessionsByDateViewModel extends ViewModelActionResponse<
  GetSessionsByDateInput,
  SessionEntity[],
  SessionHttpDto[]
> {
  publicHttpJsonResponse(timezone: string): SessionHttpDto[] {
    return this.entities.map((s) => SessionMapper.fromDomain(s, timezone))
  }
}
