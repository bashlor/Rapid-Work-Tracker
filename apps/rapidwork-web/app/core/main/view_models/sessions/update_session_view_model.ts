import type { Session as SessionEntity } from 'domain-rapid-work'

import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

import { SessionHttpDto } from '../../../../dtos/session_dto.js'
import { SessionMapper } from '../../mappers/session_mapper.js'

interface UpdateSessionInput {
  description?: null | string
  duration?: null | number
  endTime?: null | string
  id: string
  startTime?: null | string
  userId: string
}

export class UpdateSessionViewModel extends ViewModelActionResponse<
  UpdateSessionInput,
  SessionEntity,
  SessionHttpDto
> {
  publicHttpJsonResponse(timezone: string): SessionHttpDto {
    return SessionMapper.fromDomain(this.entities, timezone)
  }
}
