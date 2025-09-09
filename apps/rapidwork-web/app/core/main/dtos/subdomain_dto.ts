import DomainDto from '#dtos/domain_dto'
import TaskDto from '#dtos/task_dto'
import Subdomain from '#models/subdomain'
import { BaseModelDto } from '@adocasts.com/dto/base'

export default class SubdomainDto extends BaseModelDto {
  declare createdAt: string
  declare domain: DomainDto | null
  declare domainId: string
  declare id: string
  declare name: string
  declare tasks: TaskDto[]
  declare updatedAt: string

  constructor(subdomain?: Subdomain) {
    super()

    if (!subdomain) return
    this.id = subdomain.id
    this.domainId = subdomain.domainId
    this.name = subdomain.name
    this.createdAt = subdomain.createdAt.toISO()!
    this.updatedAt = subdomain.updatedAt.toISO()!
    this.domain = subdomain.domain && new DomainDto(subdomain.domain)
    this.tasks = TaskDto.fromArray(subdomain.tasks)
  }
}
