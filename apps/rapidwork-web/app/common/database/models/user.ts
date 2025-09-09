import type { HasMany } from '@adonisjs/lucid/types/relations'

import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

import Domain from './domain.js'
import PasswordResetToken from './password_reset_token.js'
import Session from './session.js'
import Task from './task.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  passwordColumnName: 'password',
  uids: ['email'],
})

export default class User extends compose(BaseModel, AuthFinder) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relations
  @hasMany(() => Domain)
  declare domains: HasMany<typeof Domain>

  @column()
  declare email: string

  @column()
  declare fullName: string

  @column({ isPrimary: true })
  declare id: string

  @column({ serializeAs: null })
  declare password: string

  @hasMany(() => PasswordResetToken)
  declare passwordResetTokens: HasMany<typeof PasswordResetToken>

  @hasMany(() => Session)
  declare sessions: HasMany<typeof Session>

  @hasMany(() => Task)
  declare tasks: HasMany<typeof Task>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
