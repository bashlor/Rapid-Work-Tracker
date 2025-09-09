import vine from '@vinejs/vine'

export const getDashboardDataValidator = vine.compile(
  vine.object({
    currentDate: vine.string().optional(),
  })
)
