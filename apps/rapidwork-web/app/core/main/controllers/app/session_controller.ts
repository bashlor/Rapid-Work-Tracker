import { GetDomainsAction } from '#actions/domain/get_domains_actions'
import { CreateSessionAction } from '#actions/sessions/create_session_action'
import { DeleteSessionAction } from '#actions/sessions/delete_session_action'
import { GetSessionsByDateAction } from '#actions/sessions/get_sessions_by_date_action'
import { UpdateMultipleSessionsAction } from '#actions/sessions/update_multiple_sessions_action'
import { UpdateSessionAction } from '#actions/sessions/update_session_action'
import { GetTasksAction } from '#actions/tasks/get_tasks_action'
import {
  createSessionValidator,
  getSessionsByDateValidator,
  updateMultipleSessionsValidator,
  updateSessionValidator,
} from '#validators/http_requests/session_validators'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import { validateAndStrip } from '../../validators/http_responses/common.js'
import {
  getSessionsResponseSchema,
  sessionDtoSchema,
} from '../../validators/http_responses/session_response.js'

@inject()
export default class SessionController {
  constructor(
    private createSessionAction: CreateSessionAction,
    private updateSessionAction: UpdateSessionAction,
    private deleteSessionAction: DeleteSessionAction,
    private getSessionsByDateAction: GetSessionsByDateAction,
    private getDomainsAction: GetDomainsAction,
    private getTasksAction: GetTasksAction,
    private updateMultipleSessionsAction: UpdateMultipleSessionsAction
  ) {}

  async create({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createSessionValidator)

    const vm = await this.createSessionAction.execute(user.id, data)
    const body = await validateAndStrip(sessionDtoSchema, vm.publicHttpJsonResponse)
    return { data: body }
  }

  async delete({ auth, params }: HttpContext) {
    const user = auth.getUserOrFail()

    const vm = await this.deleteSessionAction.execute({ id: params.id, userId: user.id })
    return vm.publicHttpJsonResponse
  }

  async getByDate({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const { date } = await request.validateUsing(getSessionsByDateValidator)

    const vm = await this.getSessionsByDateAction.execute({ date, userId: user.id })
    const body = await validateAndStrip(getSessionsResponseSchema, vm.publicHttpJsonResponse)
    return { data: body }
  }

  async show({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    // Récupérer les domaines et tâches pour l'interface
    const domains = await this.getDomainsAction.execute(user.id)
    const tasks = await this.getTasksAction.execute(user.id)

    // Récupérer les sessions d'aujourd'hui par défaut (format YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0] // Format: 2025-09-01

    const vm = await this.getSessionsByDateAction.execute({ date: today, userId: user.id })

    return inertia.render('sessions', {
      domains,
      selectedDate: today,
      sessions: vm.publicHttpJsonResponse,
      tasks,
    })
  }

  async update({ auth, params, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateSessionValidator)

    const vm = await this.updateSessionAction.execute(user.id, params.id, data)
    const body = await validateAndStrip(sessionDtoSchema, vm.publicHttpJsonResponse)
    return { data: body }
  }

  async updateMultiple({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateMultipleSessionsValidator)

    const vm = await this.updateMultipleSessionsAction.execute({
      sessions: data.sessions,
      userId: user.id,
    })

    return vm.publicHttpJsonResponse
  }
}
