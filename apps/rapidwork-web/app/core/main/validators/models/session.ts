import vine from '@vinejs/vine'

export const sessionValidator = vine.compile(
  vine.object({
    createdAt: vine.date({ formats: { utc: true } }),
    description: vine.string().trim().optional(),
    duration: vine.number().optional(),
    endTime: vine.date({ formats: { utc: true } }).optional(),
    id: vine.string(),
    startTime: vine.date({ formats: { utc: true } }),
    task: vine.object({}),
    taskId: vine.string(),
    updatedAt: vine.date({ formats: { utc: true } }),
    user: vine.object({}),
    userId: vine.string(),
  })
)
