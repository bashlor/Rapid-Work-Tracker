import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

import Subdomain from './subdomain.js'
import Task from './task.js'
import User from './user.js'

export default class Domain extends BaseModel {
  @column()
  declare color: null | string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare description: null | string

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @hasMany(() => Subdomain)
  declare subdomains: HasMany<typeof Subdomain>

  @hasMany(() => Task)
  declare tasks: HasMany<typeof Task>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare userId: string
}
