import UserDto from '#auth/dtos/user_dto'
import DomainDto from '#dtos/domain_dto'
import SessionDto from '#dtos/session'
import SubdomainDto from '#dtos/subdomain_dto'
import Task from '#models/task'
import { BaseModelDto } from '@adocasts.com/dto/base'

export default class TaskDto extends BaseModelDto {
  declare createdAt: string
  declare description: null | string
  declare domain: DomainDto | null
  declare domainId: string
  declare id: string
  declare sessions: SessionDto[]
  declare subdomain: null | SubdomainDto
  declare subDomainId: null | string
  declare title: string
  declare updatedAt: string
  declare user: null | UserDto
  declare userId: string

  constructor(task?: Task) {
    super()

    if (!task) return
    this.id = task.id
    this.userId = task.userId
    this.title = task.title
    this.description = task.description
    this.domainId = task.domainId
    this.subDomainId = task.subDomainId
    this.createdAt = task.createdAt.toISO()!
    this.updatedAt = task.updatedAt.toISO()!
    this.user = task.user && new UserDto(task.user)
    this.domain = task.domain && new DomainDto(task.domain)
    this.subdomain = task.subdomain && new SubdomainDto(task.subdomain)
    this.sessions = SessionDto.fromArray(task.sessions)
  }
}
