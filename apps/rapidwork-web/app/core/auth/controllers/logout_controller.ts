import type { HttpContext } from '@adonisjs/core/http'

import { inject } from '@adonisjs/core'

import { validateAndStrip } from '../../main/validators/http_responses/common.js'
import { LogoutAction } from '../actions/logout_action.js'
import { logoutSuccessSchema } from '../validators/http_responses/auth_response.js'

@inject()
export default class LogoutController {
  constructor(private logoutAction: LogoutAction) {}

  /**
   * Handle logout API requests (JSON only)
   */
  async apiStore(httpContext: HttpContext) {
    const { response } = httpContext
    await this.logoutAction.execute(httpContext)
    const body = await validateAndStrip(logoutSuccessSchema, {
      message: 'You have been logged out successfully',
      success: true as const,
    })
    return response.status(200).json(body)
  }

  /**
   * Handle logout request
   */
  async store(httpContext: HttpContext) {
    const { inertia } = httpContext
    await this.logoutAction.execute(httpContext)

    return inertia.render('auth/login', {
      flash: {
        success: 'You have been logged out successfully',
      },
    })
  }
}
