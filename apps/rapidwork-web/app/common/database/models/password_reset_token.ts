import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class PasswordResetToken extends BaseModel {
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare userId: string

  @column()
  declare value: string

  get isValid() {
    return this.expiresAt > DateTime.now()
  }
}
