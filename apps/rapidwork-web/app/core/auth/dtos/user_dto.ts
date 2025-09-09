import PasswordResetTokenDto from '#auth/dtos/password_reset_token'
import DomainDto from '#dtos/domain_dto'
import SessionDto from '#dtos/session'
import TaskDto from '#dtos/task_dto'
import User from '#models/user'
import { BaseModelDto } from '@adocasts.com/dto/base'

export default class UserDto extends BaseModelDto {
  declare createdAt: string
  declare domains: DomainDto[]
  declare email: string
  declare fullName: null | string
  declare id: string
  declare password: string
  declare passwordResetTokens: PasswordResetTokenDto[]
  declare sessions: SessionDto[]
  declare tasks: TaskDto[]
  declare updatedAt: null | string

  constructor(user?: User) {
    super()

    if (!user) return
    this.id = user.id
    this.fullName = user.fullName
    this.email = user.email
    this.password = user.password
    this.createdAt = user.createdAt.toISO()!
    this.updatedAt = user.updatedAt?.toISO()!
    this.domains = DomainDto.fromArray(user.domains)
    this.tasks = TaskDto.fromArray(user.tasks)
    this.sessions = SessionDto.fromArray(user.sessions)
    this.passwordResetTokens = PasswordResetTokenDto.fromArray(user.passwordResetTokens)
  }
}
