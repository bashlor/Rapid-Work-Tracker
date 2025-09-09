import { inject } from '@adonisjs/core'
import { DeleteTaskFeature } from 'domain-rapid-work'

import { DeleteTaskViewModel } from '../../view_models/tasks/delete_task_view_model.js'

@inject()
export class DeleteTaskAction {
  constructor(private deleteTaskFeature: DeleteTaskFeature) {}

  async execute(taskId: string, userId: string) {
    const success = await this.deleteTaskFeature.execute({ taskId, userId })
    return new DeleteTaskViewModel({ taskId, userId }, success)
  }
}
