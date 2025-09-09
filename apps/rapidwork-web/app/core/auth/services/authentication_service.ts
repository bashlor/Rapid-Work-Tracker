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
    const user = await this.verifyCredentials(email, password)
    await auth.use('web').login(user, remember)

    return {
      email: user.email,
      fullName: user.fullName,
      id: user.id,
    }
  }

  async logout({ auth }: HttpContext): Promise<void> {
    await auth.use('web').logout()
  }

  private async verifyCredentials(email: string, password: string): Promise<User> {
    return User.verifyCredentials(email, password)
  }
}
