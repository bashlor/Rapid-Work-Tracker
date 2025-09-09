import vine from '@vinejs/vine'

export const deleteTaskValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)
