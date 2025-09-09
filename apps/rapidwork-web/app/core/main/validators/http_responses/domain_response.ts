import vine from '@vinejs/vine'

export const subdomainDtoSchema = vine.object({
  createdAt: vine.string(),
  id: vine.string().uuid(),
  name: vine.string(),
  updatedAt: vine.string(),
})

export const domainWithSubdomainsDtoSchema = vine.object({
  createdAt: vine.string(),
  id: vine.string().uuid(),
  name: vine.string(),
  subdomains: vine.array(subdomainDtoSchema),
  updatedAt: vine.string(),
})

export const getDomainsResponseSchema = vine.array(domainWithSubdomainsDtoSchema)
