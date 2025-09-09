import vine from '@vinejs/vine'

export const userValidator = vine.compile(
  vine.object({
    createdAt: vine.date({ formats: { utc: true } }),
    domains: vine.array(vine.object({})),
    email: vine.string().trim(),
    fullName: vine.string().trim().optional(),
    id: vine.number(),
    password: vine.string().trim(),
    passwordResetTokens: vine.array(vine.object({})),
    sessions: vine.array(vine.object({})),
    tasks: vine.array(vine.object({})),
    updatedAt: vine.date({ formats: { utc: true } }).optional(),
  })
)
