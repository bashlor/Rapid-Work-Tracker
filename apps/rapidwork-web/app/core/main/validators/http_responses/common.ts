import vine from '@vinejs/vine'

export async function validateAndStrip<T>(
  schema: any | ReturnType<typeof vine.object>,
  data: unknown
): Promise<T> {
  // Accept compiled schemas or raw schema nodes
  const compiled = 'validator' in schema ? schema : vine.compile(schema)
  const result = await compiled.validate(data)
  return result as T
}
