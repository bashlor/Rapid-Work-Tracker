import vine from '@vinejs/vine'

export const deleteSubDomainValidator = vine.compile(
  vine.object({
    params: vine.object({
      subdomain_id: vine.string().uuid(),
    }),
  })
)
