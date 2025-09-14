import type { Session as SessionEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

import { SessionHttpDto } from '../../../../dtos/session_dto.js'
import { SessionMapper } from '../../mappers/session_mapper.js'

interface CreateSessionInput {
  description?: null | string
  duration?: number // in seconds - optional, for effective work time
  endTime: string
  startTime: string
  taskId: string
  userId: string
}

export class CreateSessionViewModel extends ViewModelActionResponse<
  CreateSessionInput,
  SessionEntity,
  SessionHttpDto
> {
  publicHttpJsonResponse(timezone: string): SessionHttpDto {
    return SessionMapper.fromDomain(this.entities, timezone)
  }
}
