import { GetDomainsAction } from '#actions/domain/get_domains_actions'
import { GetTasksAction } from '#actions/tasks/get_tasks_action' // Add this import
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UserWorkDataController {
  @inject()
  async show(
    { auth, inertia }: HttpContext,
    getDomainsAction: GetDomainsAction,
    getTasksAction: GetTasksAction
  ) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    const domainsViewModel = await getDomainsAction.execute(user.id)
    const tasksViewModel = await getTasksAction.execute(user.id)

    return inertia.render('user_work_data', {
      domains: () => domainsViewModel.publicHttpJsonResponse(),
      tasks: () => tasksViewModel.publicHttpJsonResponse(),
    })
  }
}
