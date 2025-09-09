import type { HttpContext } from '@adonisjs/core/http'

import { inject } from '@adonisjs/core'

import { validateAndStrip } from '../../main/validators/http_responses/common.js'
import { LoginAction } from '../actions/login_action.js'
import { loginValidator } from '../validators/http_requests/login_validator.js'
import { authFailSchema, authSuccessSchema } from '../validators/http_responses/auth_response.js'

@inject()
export default class LoginController {
  constructor(private loginAction: LoginAction) {}

  /**
   * Handle login API requests (JSON only)
   */
  async apiStore(httpContext: HttpContext) {
    const { request, response } = httpContext
    const data = await request.validateUsing(loginValidator)

    const result = await this.loginAction.execute(httpContext, data)

    if (!result.success) {
      const body = await validateAndStrip(authFailSchema, {
        error: result.error || 'Login failed',
        success: false,
      })
      return response.status(401).json(body)
    }

    const body = await validateAndStrip(authSuccessSchema, {
      message: 'User authenticated successfully',
      success: true as const,
      user: result.user,
    })
    return response.status(200).json(body)
  }

  async show({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  /**
   * Handle login form submission (Inertia only)
   */
  async store(httpContext: HttpContext) {
    const { inertia, request } = httpContext
    const data = await request.validateUsing(loginValidator)

    const result = await this.loginAction.execute(httpContext, data)

    if (!result.success) {
      return inertia.render('auth/login', {
        errors: {
          general: result.error || 'Login failed',
        },
        flash: {
          error: result.error || 'Login failed',
        },
      })
    }

    // Redirect to home after successful login
    return inertia.location('/app/home')
  }
}
