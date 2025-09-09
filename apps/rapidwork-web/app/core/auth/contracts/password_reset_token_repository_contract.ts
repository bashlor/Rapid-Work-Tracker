import PasswordResetToken from '#models/password_reset_token'

export interface PasswordResetTokenRepositoryContract {
  /**
   * Clean up expired tokens
   */
  cleanupExpired(): Promise<void>

  /**
   * Create a new password reset token
   */
  create(data: { expiresAt: Date; userId: string; value: string }): Promise<PasswordResetToken>

  /**
   * Delete a specific token
   */
  delete(tokenId: number): Promise<void>

  /**
   * Delete all tokens for a user
   */
  deleteForUser(userId: string): Promise<void>

  /**
   * Find a valid token by value
   */
  findValidToken(value: string): Promise<null | PasswordResetToken>
}
