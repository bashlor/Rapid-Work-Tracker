import { ViewModelActionResponse } from '#view_models/base/view_model_action_response'

interface DeleteTaskInput {
  taskId: string
  userId: string
}

interface DeleteTaskOutput {
  message: string
  success: boolean
}

export class DeleteTaskViewModel extends ViewModelActionResponse<DeleteTaskInput, boolean> {
  publicHttpJsonResponse(): DeleteTaskOutput {
    return {
      message: this.entities ? 'Task deleted successfully' : 'Failed to delete task',
      success: this.entities,
    }
  }
}
