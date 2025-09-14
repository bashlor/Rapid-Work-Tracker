import { HttpContext } from '@adonisjs/core/http'

export interface AuthenticationServiceLoginUserResponse {
  email: string
  fullName: string
  id: string
}

export abstract class AuthenticationServiceContract {
  abstract login(
    httpContext: HttpContext,
    { email, password, remember }: { email: string; password: string; remember: boolean }
  ): Promise<AuthenticationServiceLoginUserResponse>
  abstract logout(httpContext: HttpContext): Promise<void>
}
