import vine from '@vinejs/vine'

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(8),
    password_confirmation: vine.string().confirmed({ confirmationField: 'password' }),
    token: vine.string().trim().minLength(1),
  })
)
