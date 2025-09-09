import vine from '@vinejs/vine'

export const relatedDomainSchema = vine.object({
  createdAt: vine.string(),
  id: vine.string().uuid(),
  name: vine.string(),
  updatedAt: vine.string(),
})

export const relatedSubdomainSchema = vine.object({
  createdAt: vine.string(),
  domainId: vine.string().uuid(),
  id: vine.string().uuid(),
  name: vine.string(),
  updatedAt: vine.string(),
})

export const taskWithRelationsDtoSchema = vine.object({
  createdAt: vine.string(),
  description: vine.string().nullable(),
  domain: relatedDomainSchema.nullable(),
  domainId: vine.string().uuid().nullable(),
  id: vine.string().uuid(),
  status: vine.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  subdomain: relatedSubdomainSchema.nullable(),
  subDomainId: vine.string().uuid().nullable(),
  title: vine.string(),
  updatedAt: vine.string(),
  userId: vine.string().uuid().optional(), // not exposed currently by the view model
})

export const getTasksResponseSchema = vine.array(taskWithRelationsDtoSchema)

export const deleteResultSchema = vine.object({
  message: vine.string(),
  success: vine.boolean(),
})
