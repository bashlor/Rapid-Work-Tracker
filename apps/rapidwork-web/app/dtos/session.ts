import TaskDto from '#dtos/task_dto'
import Session from '#models/session'
import { BaseModelDto } from '@adocasts.com/dto/base'

import UserDto from '../core/auth/dtos/user_dto.js'

export default class SessionDto extends BaseModelDto {
  declare createdAt: string
  declare description: null | string
  declare duration: null | number
  declare endTime: null | string
  declare id: string
  declare startTime: string
  declare task: null | TaskDto
  declare taskId: string
  declare updatedAt: string
  declare user: null | UserDto
  declare userId: string

  constructor(session?: Session) {
    super()

    if (!session) return
    this.id = session.id
    this.userId = session.userId
    this.taskId = session.taskId
    this.startTime = session.startTime.toISO()!
    this.endTime = session.endTime?.toISO()!
    this.duration = session.duration
    this.description = session.description
    this.createdAt = session.createdAt.toISO()!
    this.updatedAt = session.updatedAt.toISO()!
    this.user = session.user && new UserDto(session.user)
    this.task = session.task && new TaskDto(session.task)
  }
}
