import SubdomainDto from '#dtos/subdomain_dto'
import TaskDto from '#dtos/task_dto'
import Domain from '#models/domain'
import { BaseModelDto } from '@adocasts.com/dto/base'

import UserDto from '../core/auth/dtos/user_dto.js'

export default class DomainDto extends BaseModelDto {
  declare color: null | string
  declare createdAt: string
  declare description: null | string
  declare id: string
  declare name: string
  declare subdomains: SubdomainDto[]
  declare tasks: TaskDto[]
  declare updatedAt: null | string
  declare user: null | UserDto
  declare userId: string

  constructor(domain?: Domain) {
    super()

    if (!domain) return
    this.id = domain.id
    this.userId = domain.userId
    this.name = domain.name
    this.description = domain.description
    this.color = domain.color
    this.createdAt = domain.createdAt.toISO()!
    this.updatedAt = domain.updatedAt?.toISO()!
    this.user = domain.user && new UserDto(domain.user)
    this.subdomains = SubdomainDto.fromArray(domain.subdomains)
    this.tasks = TaskDto.fromArray(domain.tasks)
  }
}
