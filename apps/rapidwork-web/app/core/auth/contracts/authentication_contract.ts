import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export abstract class AuthenticationServiceContract {
  abstract login(
    httpContext: HttpContext,
    { email, password, remember }: { email: string; password: string; remember: boolean }
  ): Promise<Pick<User, 'email' | 'fullName' | 'id'>>
  abstract logout(httpContext: HttpContext): Promise<void>
}
