import { User, UserBuilder } from 'domain-rapid-work'

export class UserMapper {
  static fromDomain(user: User): any {
    return {
      createdAt: new Date(user.createdAt.toISOString()),
      email: user.email.value,
      fullName: user.fullName.value,
      id: user.id.value, // Keep as string UUID
      password: user.hashedPassword?.value || user.plainPassword?.value || '',
    }
  }

  static toDomain(userModel: any): null | User {
    if (!userModel) return null

    return new UserBuilder()
      .withId(userModel.id)
      .withEmail(userModel.email)
      .withFullName(userModel.fullName || 'User')
      .withHashedPassword(userModel.password || '') // Password field is hashed
      .withCreatedAt(userModel.createdAt.toISO())
      .build()
  }

  static toDomainArray(userModels: any[]): User[] {
    return userModels
      .map((model) => this.toDomain(model))
      .filter((user): user is User => user !== null)
  }
}
