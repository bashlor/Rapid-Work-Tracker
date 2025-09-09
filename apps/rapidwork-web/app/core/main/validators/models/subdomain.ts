import vine from '@vinejs/vine'

export const subdomainValidator = vine.compile(
  vine.object({
    createdAt: vine.date({ formats: { utc: true } }),
    domain: vine.object({}),
    domainId: vine.number(),
    id: vine.number(),
    name: vine.string().trim(),
    tasks: vine.array(vine.object({})),
    updatedAt: vine.date({ formats: { utc: true } }),
  })
)
