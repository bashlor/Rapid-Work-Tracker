import type { Session as SessionEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

import { SessionMapper } from '../../mappers/session_mapper.js'
import { SessionHttpDto } from './session_dto.js'

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
  get publicHttpJsonResponse(): SessionHttpDto {
    return SessionMapper.fromDomain(this.entities)
  }
}
