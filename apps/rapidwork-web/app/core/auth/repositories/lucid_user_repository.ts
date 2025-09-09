import User from '#models/user'
import { Email, Id, UserCollection, User as UserEntity } from 'domain-rapid-work'

import { UserMapper } from '../mappers/user_mapper.js'

export class LucidUserRepository extends UserCollection {
  async create(data: UserEntity): Promise<UserEntity> {
    const userData = UserMapper.fromDomain(data)
    const userModel = await User.create({
      email: userData.email,
      fullName: userData.fullName,
      id: userData.id, // Include the UUID
      password: userData.password,
    })
    return UserMapper.toDomain(userModel)!
  }

  async delete(id: Id): Promise<boolean> {
    const userModel = await User.find(id.value)
    if (!userModel) return false

    await userModel.delete()
    return true
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const userModel = await User.findBy('email', email.value)
    return userModel !== null
  }

  async findByEmail(email: Email): Promise<null | UserEntity> {
    const userModel = await User.findBy('email', email.value)
    return UserMapper.toDomain(userModel)
  }

  async findById(id: Id): Promise<null | UserEntity> {
    const userModel = await User.find(id.value)
    return UserMapper.toDomain(userModel)
  }

  async update(id: Id, data: UserEntity): Promise<UserEntity> {
    const userModel = await User.findOrFail(id.value)
    const userData = UserMapper.fromDomain(data)
    userModel.merge({
      email: userData.email,
      fullName: userData.fullName,
      password: userData.password,
    })
    await userModel.save()
    return UserMapper.toDomain(userModel)!
  }
}
