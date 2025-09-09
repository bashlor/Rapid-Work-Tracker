import { inject } from '@adonisjs/core'
import { GetUserDataDashboardFeature } from 'domain-rapid-work'

@inject()
export class GetUserDataDashboardAction {
  constructor(private getUserDataDashboardFeature: GetUserDataDashboardFeature) {}

  async execute(userId: string, currentDate: string) {
    const dashboardData = await this.getUserDataDashboardFeature.execute({
      currentDate,
      userId,
    })

    return dashboardData.toJSON()
  }
}
