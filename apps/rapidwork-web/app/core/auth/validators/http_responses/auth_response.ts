import vine from '@vinejs/vine'

export const authUserSchema = vine.object({
  email: vine.string().email(),
  fullName: vine.string(),
  id: vine.string().uuid(),
})

export const authSuccessSchema = vine.object({
  message: vine.string(),
  success: vine.literal(true),
  user: authUserSchema,
})

export const authFailSchema = vine.object({
  error: vine.string(),
  success: vine.literal(false),
})

export const logoutSuccessSchema = vine.object({
  message: vine.string(),
  success: vine.literal(true),
})
