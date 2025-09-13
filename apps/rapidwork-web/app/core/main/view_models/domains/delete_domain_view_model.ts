import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

interface DeleteDomainInput {
  domainId: string
  userId: string
}

interface DeleteDomainOutput {
  message: string
  success: boolean
}

export class DeleteDomainViewModel extends ViewModelActionResponse<
  DeleteDomainInput,
  boolean,
  DeleteDomainOutput
> {
  publicHttpJsonResponse(): DeleteDomainOutput {
    return {
      message: this.entities ? 'Domain deleted successfully' : 'Failed to delete domain',
      success: this.entities,
    }
  }
}
