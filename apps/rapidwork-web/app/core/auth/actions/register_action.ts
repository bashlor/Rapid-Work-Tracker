import { inject } from '@adonisjs/core'
import { Email, User, UserBuilder, UserCollection } from 'domain-rapid-work'

export interface RegisterParams {
  email: string
  full_name: string
  password: string
}

export type RegisterResult =
  | {
      error: string
      success: false
    }
  | {
      success: true
      user: Pick<User, 'email' | 'fullName' | 'id'>
    }

@inject()
export class RegisterAction {
  constructor(private userCollection: UserCollection) {}

  async execute(params: RegisterParams): Promise<RegisterResult> {
    const { email, full_name: fullName, password } = params

    try {
      const existingUser = await this.userCollection.existsByEmail(new Email(email))

      if (existingUser) {
        return {
          error: 'An account with this email already exists',
          success: false,
        }
      }

      const user = new UserBuilder()
        .generateId()
        .withEmail(email)
        .withFullName(fullName)
        .withPlainPassword(password)
        .build()

      const createdUser = await this.userCollection.create(user)
      return {
        success: true,
        user: createdUser,
      }
    } catch (error) {
      return {
        error: 'Registration failed. Please try again.',
        success: false,
      }
    }
  }
}
