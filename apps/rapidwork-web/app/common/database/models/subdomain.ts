import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

import Domain from './domain.js'
import Task from './task.js'

export default class Subdomain extends BaseModel {
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relations
  @belongsTo(() => Domain)
  declare domain: BelongsTo<typeof Domain>

  @column()
  declare domainId: string

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @hasMany(() => Task)
  declare tasks: HasMany<typeof Task>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
