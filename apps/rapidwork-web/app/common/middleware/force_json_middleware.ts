import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Force JSON middleware ensures that API routes only accept JSON requests
 * Returns 422 Unprocessable Entity if Accept header is not application/json
 */
export default class ForceJsonMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx

    // Check if Accept header includes application/json
    const acceptHeader = request.header('accept')
    const acceptsJson =
      acceptHeader && (acceptHeader.includes('application/json') || acceptHeader.includes('*/*'))

    if (!acceptsJson) {
      return response.status(422).json({
        code: 'INVALID_ACCEPT_HEADER',
        error:
          'API endpoints only accept JSON requests. Please set Accept header to application/json',
        success: false,
      })
    }

    // Remove X-Inertia header if present to prevent Inertia behavior
    if (request.header('x-inertia')) {
      delete request.headers()['x-inertia']
    }

    return next()
  }
}
