import type { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/landing'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    try {
      //If its an inertia request
      if (ctx.request.header('x-inertia')) {
        await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
      } else {
        await ctx.auth.authenticateUsing(options.guards)
      }
    } catch {
      if (ctx.request.header('accept')?.includes('application/json')) {
        return ctx.response.status(401).json({
          code: 'UNAUTHORIZED',
          error: 'Authentication required',
          success: false,
        })
      }

      return ctx.response.redirect(this.redirectTo, true)
    }
    return next()
  }
}
