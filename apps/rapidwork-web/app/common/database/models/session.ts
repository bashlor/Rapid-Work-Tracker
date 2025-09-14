import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

import Task from './task.js'
import User from './user.js'

export default class Session extends BaseModel {
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare description: null | string

  @column()
  declare duration: null | number

  @column.dateTime()
  declare endTime: DateTime

  @column({ isPrimary: true })
  declare id: string

  @column.dateTime()
  declare startTime: DateTime

  @belongsTo(() => Task)
  declare task: BelongsTo<typeof Task>

  @column()
  declare taskId: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare userId: string
}
