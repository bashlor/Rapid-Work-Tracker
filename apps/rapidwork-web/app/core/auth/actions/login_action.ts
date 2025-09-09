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
      return {
        error: error.message || 'Login failed',
        success: false,
      }
    }
  }
}
