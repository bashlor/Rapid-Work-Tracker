import vine from '@vinejs/vine'

export const updateDomainValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    params: vine.object({
      domain_id: vine.string().uuid(),
    }),
  })
)
