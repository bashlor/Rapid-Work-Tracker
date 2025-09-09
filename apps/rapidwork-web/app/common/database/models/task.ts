import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { TaskStatusValueType } from 'domain-rapid-work'

import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

import Domain from './domain.js'
import Session from './session.js'
import Subdomain from './subdomain.js'
import User from './user.js'

export default class Task extends BaseModel {
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare description: null | string

  @belongsTo(() => Domain)
  declare domain: BelongsTo<typeof Domain>

  @column()
  declare domainId: string

  @column({ isPrimary: true })
  declare id: string

  @hasMany(() => Session)
  declare sessions: HasMany<typeof Session>

  @column()
  declare status: TaskStatusValueType

  @belongsTo(() => Subdomain)
  declare subdomain: BelongsTo<typeof Subdomain>

  @column()
  declare subDomainId: null | string

  @column()
  declare title: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare userId: string
}
