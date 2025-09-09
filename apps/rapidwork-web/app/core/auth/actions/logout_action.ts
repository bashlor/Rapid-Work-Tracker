import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import { AuthenticationService } from '../services/authentication_service.js'

@inject()
export class LogoutAction {
  constructor(private authService: AuthenticationService) {}

  async execute(ctx: HttpContext): Promise<void> {
    return this.authService.logout(ctx)
  }
}
