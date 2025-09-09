import vine from '@vinejs/vine'

export const passwordResetTokenValidator = vine.compile(
  vine.object({
    createdAt: vine.date({ formats: { utc: true } }),
    expiresAt: vine.date({ formats: { utc: true } }),
    id: vine.number(),
    isValid: vine.boolean(),
    updatedAt: vine.date({ formats: { utc: true } }),
    user: vine.object({}),
    userId: vine.number(),
    value: vine.string().trim(),
  })
)
