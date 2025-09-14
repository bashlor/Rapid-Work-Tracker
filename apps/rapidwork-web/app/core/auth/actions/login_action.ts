import type User from '#models/user'

import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import { AuthenticationService } from '../services/authentication_service.js'

export interface LoginParams {
  email: string
  password: string
  rememberMe?: boolean
}

export type LoginResult =
  | {
      error: string
      status: number
      success: false
    }
  | {
      success: true
      user: Pick<User, 'email' | 'fullName' | 'id'>
    }

@inject()
export class LoginAction {
  constructor(private authService: AuthenticationService) {}

  async execute(httpContext: HttpContext, params: LoginParams): Promise<LoginResult> {
    try {
      const { email, password, rememberMe } = params
      const user = await this.authService.login(httpContext, {
        email,
        password,
        remember: rememberMe || false,
      })

      return {
        success: true,
        user,
      }
    } catch (error) {
      // Distinguish invalid credentials from infrastructure/DB errors
      const code = (error as any)?.code
      if (code === 'E_INVALID_CREDENTIALS') {
        return {
          error: 'Invalid email or password',
          status: 401,
          success: false,
        }
      }

      return {
        error: 'Unexpected error while authenticating. Please try again later.',
        status: 500,
        success: false,
      }
    }
  }
}
