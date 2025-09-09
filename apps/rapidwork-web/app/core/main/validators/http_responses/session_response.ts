import vine from '@vinejs/vine'

export const sessionDtoSchema = vine.object({
  description: vine.string().nullable(),
  duration: vine.number().nullable(),
  endTime: vine.string().nullable(),
  id: vine.string().uuid(),
  startTime: vine.string(),
  taskId: vine.string().uuid(),
  userId: vine.string().uuid(),
})

export const getSessionsResponseSchema = vine.array(sessionDtoSchema)
