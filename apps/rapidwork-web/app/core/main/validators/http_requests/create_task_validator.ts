import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
  vine.object({
    description: vine.string().trim().optional(),
    domain_id: vine.string().uuid().optional(),
    status: vine.enum(['pending', 'in_progress', 'completed', 'cancelled']),
    subdomain_id: vine.string().uuid().optional(),
    title: vine.string().trim().minLength(1).maxLength(255),
  })
)
