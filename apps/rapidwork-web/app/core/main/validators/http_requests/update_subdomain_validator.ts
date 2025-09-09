import vine from '@vinejs/vine'

export const updateSubDomainValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    params: vine.object({
      subdomain_id: vine.string().uuid(),
    }),
  })
)
