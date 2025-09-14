import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { errors as vineErrors } from '@vinejs/vine'
import { DomainError } from 'domain-rapid-work'

import { getHttpExceptionFromDomainError } from '../util/domain_error_factory_mapper.js'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error, { inertia }) => inertia.render('errors/not_found', { error }),
    '500..599': (error, { inertia }) => inertia.render('errors/server_error', { error }),
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Handle Vine validation errors
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      const acceptsJson = ctx.request.accepts(['html', 'json']) === 'json'
      const isInertiaRequest = ctx.request.header('X-Inertia')

      // For API or JSON requests
      if (acceptsJson) {
        // Transform VineJS errors to desired format
        const formattedErrors = Object.entries(error.messages).map(([field, message]) => ({
          field,
          message: message as string,
        }))

        return ctx.response.status(422).json({
          errors: formattedErrors,
          message: 'Validation failed',
        })
      }

      // For Inertia requests (forms)
      if (isInertiaRequest) {
        // Store errors in session for Inertia
        const errorMessages: Record<string, string> = {}
        Object.entries(error.messages).forEach(([field, message]) => {
          errorMessages[field] = message as string
        })

        ctx.session.flash('errors', errorMessages)
        ctx.session.flash('notification', {
          message: 'Please correct the errors in the form',
          type: 'error',
        })

        return ctx.response.redirect().back()
      }
    }

    // Try also with ValidationError (fallback)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as any).code === 'E_VALIDATION_ERROR'
    ) {
      const isApiRoute = ctx.request.url().startsWith('/api/')
      const acceptsJson = ctx.request.accepts(['html', 'json']) === 'json'
      const isInertiaRequest = ctx.request.header('X-Inertia')
      const validationError = error as any

      if (isApiRoute || acceptsJson) {
        // Transform VineJS errors to desired format
        const formattedErrors = Object.entries(validationError.messages || {}).map(
          ([field, message]) => ({
            field,
            message: message as string,
          })
        )

        return ctx.response.status(422).json({
          errors: formattedErrors,
          message: 'Validation failed',
        })
      }

      // For Inertia requests (fallback)
      if (isInertiaRequest) {
        const errorMessages: Record<string, string> = {}
        Object.entries(validationError.messages || {}).forEach(([field, message]) => {
          errorMessages[field] = message as string
        })

        ctx.session.flash('errors', errorMessages)
        ctx.session.flash('notification', {
          message: 'Please correct the errors in the form',
          type: 'error',
        })

        return ctx.response.redirect().back()
      }
    }

    if (error && error instanceof DomainError) {
      const { httpException } = getHttpExceptionFromDomainError(error)
      return ctx.response.status(httpException.status).send(httpException.message)
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
