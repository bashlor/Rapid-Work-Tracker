import vine from '@vinejs/vine'

export const taskValidator = vine.compile(
  vine.object({
    createdAt: vine.date({ formats: { utc: true } }),
    description: vine.string().trim().optional(),
    domain: vine.object({}),
    domainId: vine.number().optional(),
    id: vine.number(),
    sessions: vine.array(vine.object({})),
    subdomain: vine.object({}),
    subDomainId: vine.number().optional(),
    title: vine.string().trim(),
    updatedAt: vine.date({ formats: { utc: true } }),
    user: vine.object({}),
    userId: vine.number(),
  })
)
