import type { HttpContext } from '@adonisjs/core/http'

import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import { validateAndStrip } from '../../main/validators/http_responses/common.js'
import { LoginAction } from '../actions/login_action.js'
import { RegisterAction } from '../actions/register_action.js'
import { registerValidator } from '../validators/http_requests/register_validator.js'
import { authSuccessSchema } from '../validators/http_responses/auth_response.js'

@inject()
export default class RegisterController {
  constructor(
    private readonly registerAction: RegisterAction,
    private readonly loginAction: LoginAction
  ) {}

  /**
   * Handle registration API requests (JSON only)
   */
  async apiStore(httpContext: HttpContext) {
    const { request, response } = httpContext
    const data = await request.validateUsing(registerValidator)

    const result = await this.registerAction.execute(data)

    if (!result.success) {
      // Keep the existing error shape (no success false schema for register)
      return response.status(400).json({
        error: result.error || 'Registration failed',
        success: false,
      })
    }

    // Automatically log in the user after registration
    const loginResult = await this.loginAction.execute(httpContext, {
      email: data.email,
      password: data.password,
    })

    if (!loginResult.success) {
      // Registration succeeded but login failed
      const body = await validateAndStrip(authSuccessSchema, {
        message: 'Account created successfully! Please log in.',
        success: true as const,
        user: result.user,
      })
      return response.status(201).json(body)
    }

    // Registration and login both succeeded
    const body = await validateAndStrip(authSuccessSchema, {
      message: 'User registered and authenticated successfully',
      success: true as const,
      user: loginResult.user,
    })
    return response.status(201).json(body)
  }

  /**
   * Show the register page
   */
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  /**
   * Handle registration form submission (Inertia only)
   */
  async store(httpContext: HttpContext) {
    const { inertia, request } = httpContext

    const data = await request.validateUsing(registerValidator)
    const result = await this.registerAction.execute(data)

    if (!result.success) {
      return inertia.render('auth/register', {
        errors: {
          general: result.error || 'Registration failed',
        },
        flash: {
          error: result.error || 'Registration failed',
        },
      })
    }

    // Automatically log in the user after registration
    const loginResult = await this.loginAction.execute(httpContext, {
      email: data.email,
      password: data.password,
    })

    if (!loginResult.success) {
      // Registration succeeded but login failed - redirect to login
      return inertia.render('auth/login', {
        flash: {
          success: 'Account created successfully! Please log in.',
        },
      })
    }

    // Registration and login both succeeded - redirect to home
    return inertia.location('/app/home')
  }
}
