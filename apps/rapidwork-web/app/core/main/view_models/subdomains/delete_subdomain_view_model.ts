import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

interface DeleteSubdomainInput {
  subdomainId: string
  userId: string
}

interface DeleteSubdomainOutput {
  message: string
  success: boolean
}

export class DeleteSubdomainViewModel extends ViewModelActionResponse<
  DeleteSubdomainInput,
  boolean,
  DeleteSubdomainOutput
> {
  get publicHttpJsonResponse(): DeleteSubdomainOutput {
    return {
      message: this.entities ? 'Subdomain deleted successfully' : 'Failed to delete subdomain',
      success: this.entities,
    }
  }
}
