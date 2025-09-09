import type { Session as SessionEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

import { SessionMapper } from '../../mappers/session_mapper.js'
import { SessionHttpDto } from './session_dto.js'

interface GetSessionsByDateInput {
  date: string
  userId: string
}

export class GetSessionsByDateViewModel extends ViewModelActionResponse<
  GetSessionsByDateInput,
  SessionEntity[],
  SessionHttpDto[]
> {
  get publicHttpJsonResponse(): SessionHttpDto[] {
    return this.entities.map((s) => SessionMapper.fromDomain(s))
  }
}
