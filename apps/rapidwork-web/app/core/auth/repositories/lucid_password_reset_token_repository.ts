import { PasswordResetTokenRepositoryContract } from '#contracts/password_reset_token_repository_contract'
import PasswordResetToken from '#models/password_reset_token'
import { DateTime } from 'luxon'

export class LucidPasswordResetTokenRepository implements PasswordResetTokenRepositoryContract {
  async cleanupExpired(): Promise<void> {
    await PasswordResetToken.query().where('expires_at', '<', DateTime.now().toSQL()).delete()
  }

  async create(data: {
    expiresAt: Date
    userId: string
    value: string
  }): Promise<PasswordResetToken> {
    return await PasswordResetToken.create({
      expiresAt: DateTime.fromJSDate(data.expiresAt),
      userId: data.userId,
      value: data.value,
    })
  }

  async delete(tokenId: number): Promise<void> {
    await PasswordResetToken.query().where('id', tokenId).delete()
  }

  async deleteForUser(userId: string): Promise<void> {
    await PasswordResetToken.query().where('user_id', userId).delete()
  }

  async findValidToken(value: string): Promise<null | PasswordResetToken> {
    const token = await PasswordResetToken.query()
      .where('value', value)
      .where('expires_at', '>', DateTime.now().toSQL())
      .preload('user')
      .first()

    return token
  }
}
