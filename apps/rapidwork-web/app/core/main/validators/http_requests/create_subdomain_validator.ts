import vine from '@vinejs/vine'

export const createSubDomainValidator = vine.compile(
  vine.object({
    domain_id: vine.string().uuid(),
    name: vine.string().trim().minLength(1).maxLength(100),
  })
)
