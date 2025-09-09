import type { HttpContext } from '@adonisjs/core/http'

import { GetUserDataDashboardAction } from '#actions/dashboard/get_user_data_dashboard_action'
import { getDashboardDataValidator } from '#validators/http_requests/dashboard_validators'
import { inject } from '@adonisjs/core'

import { toGetUserDataDashboardViewModel } from '../../view_models/dashboard/get_user_data_dashboard_view_model.js'

@inject()
export default class DashboardController {
  constructor(private getUserDataDashboardAction: GetUserDataDashboardAction) {}

  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(getDashboardDataValidator)

    // Use current date if not provided
    const currentDate = payload.currentDate || new Date().toISOString()

    const dashboardData = await this.getUserDataDashboardAction.execute(user.id, currentDate)

    return response.ok(toGetUserDataDashboardViewModel(dashboardData))
  }
}
