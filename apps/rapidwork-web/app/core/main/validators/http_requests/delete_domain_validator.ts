import vine from '@vinejs/vine'

export const deleteDomainValidator = vine.compile(
  vine.object({
    params: vine.object({
      domain_id: vine.string().uuid(),
    }),
  })
)
