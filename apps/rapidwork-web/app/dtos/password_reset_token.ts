import PasswordResetToken from '#models/password_reset_token'
import { BaseModelDto } from '@adocasts.com/dto/base'

import UserDto from '../core/auth/dtos/user_dto.js'

export default class PasswordResetTokenDto extends BaseModelDto {
  declare createdAt: string
  declare expiresAt: string
  declare id: number
  declare isValid: boolean
  declare updatedAt: string
  declare user: null | UserDto
  declare userId: string
  declare value: string

  constructor(passwordResetToken?: PasswordResetToken) {
    super()

    if (!passwordResetToken) return
    this.id = passwordResetToken.id
    this.userId = passwordResetToken.userId
    this.value = passwordResetToken.value
    this.expiresAt = passwordResetToken.expiresAt.toISO()!
    this.createdAt = passwordResetToken.createdAt.toISO()!
    this.updatedAt = passwordResetToken.updatedAt.toISO()!
    this.user = passwordResetToken.user && new UserDto(passwordResetToken.user)
    this.isValid = passwordResetToken.isValid
  }
}
