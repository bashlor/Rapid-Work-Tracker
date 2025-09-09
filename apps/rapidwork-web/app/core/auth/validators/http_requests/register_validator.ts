import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase().trim(),
    full_name: vine.string().maxLength(254),
    password: vine.string().minLength(8),
    password_confirmation: vine.string().minLength(8).confirmed({ confirmationField: 'password' }),
  })
)

export const passwordResetSendValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase().trim(),
  })
)

export const passwordResetValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(8),
  })
)
