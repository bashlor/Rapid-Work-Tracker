import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

import { AuthenticationServiceContract } from '../contracts/authentication_contract.js'

export class AuthenticationService implements AuthenticationServiceContract {
  constructor() {}

  async login(
    { auth }: HttpContext,
    {
      email,
      password,
      remember,
    }: {
      email: string
      password: string
      remember: boolean
    }
  ): Promise<Pick<User, 'email' | 'fullName' | 'id'>> {
    try {
      const user = await this.verifyCredentials(email, password)
      await auth.use('web').login(user, remember)

      return {
        email: user.email,
        fullName: user.fullName,
        id: user.id,
      }
    } catch (error) {
      // Keep Adonis invalid credentials error as-is
      if (this.isInvalidCredentialsError(error)) {
        throw error
      }

      // Re-throw database/driver errors with a stable auth-specific code
      if (this.isLikelyDatabaseError(error)) {
        const err = new Error('Database error during authentication') as any
        err.code = 'E_AUTH_DB'
        err.cause = error
        throw err
      }

      // Unknown error
      throw error
    }
  }

  async logout({ auth }: HttpContext): Promise<void> {
    await auth.use('web').logout()
  }

  private isInvalidCredentialsError(error: unknown): boolean {
    return !!(
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as any).code === 'E_INVALID_CREDENTIALS'
    )
  }

  private isLikelyDatabaseError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    const e = error as any
    // Knex/pg errors often include one or more of these fields
    if (typeof e.code === 'string') {
      // SQLSTATE codes (e.g. '23505') or driver/network codes (e.g. 'ECONNREFUSED')
      if (/^\d{5}$/.test(e.code) || /^E[A-Z_]+$/.test(e.code)) return true
      // Treat other string codes (except known auth code) as DB/driver codes
      if (e.code !== 'E_INVALID_CREDENTIALS') return true
    }
    return (
      'severity' in e ||
      'routine' in e ||
      'schema' in e ||
      'table' in e ||
      'column' in e ||
      'constraint' in e ||
      'errno' in e ||
      'sql' in e
    )
  }

  private async verifyCredentials(email: string, password: string): Promise<User> {
    return User.verifyCredentials(email, password)
  }
}
