import vine from '@vinejs/vine'

export const domainValidator = vine.compile(
  vine.object({
    color: vine.string().trim().optional(),
    createdAt: vine.date({ formats: { utc: true } }),
    description: vine.string().trim().optional(),
    id: vine.number(),
    name: vine.string().trim(),
    subdomains: vine.array(vine.object({})),
    tasks: vine.array(vine.object({})),
    updatedAt: vine.date({ formats: { utc: true } }).optional(),
    user: vine.object({}),
    userId: vine.number(),
  })
)
