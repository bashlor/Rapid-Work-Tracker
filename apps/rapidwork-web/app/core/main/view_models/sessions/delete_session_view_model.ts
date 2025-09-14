import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

interface DeleteSessionInput {
  id: string
  userId: string
}

interface DeleteSessionOutput {
  message: string
  success: boolean
}

export class DeleteSessionViewModel extends ViewModelActionResponse<DeleteSessionInput, boolean> {
  publicHttpJsonResponse(): DeleteSessionOutput {
    return {
      message: this.entities ? 'Session supprimée' : "La session n'existe pas",
      success: this.entities,
    }
  }
}
