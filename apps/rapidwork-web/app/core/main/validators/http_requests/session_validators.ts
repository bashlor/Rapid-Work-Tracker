import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

// Custom validation pour vérifier que endTime > startTime sur l'objet complet
const sessionTimeValidator = vine.createRule((value, _options, field) => {
  if (!field.isValid) return

  // value contient l'objet session complet
  const { endTime, startTime } = value as { endTime?: string; startTime?: string }

  if (startTime && endTime) {
    // Enforce ISO UTC interpretation
    const start = DateTime.fromISO(startTime, { zone: 'utc' })
    const end = DateTime.fromISO(endTime, { zone: 'utc' })

    if (!start.isValid || !end.isValid) {
      field.report('Format de date invalide (ISO UTC requis)', 'invalidDateFormat', field)
      return
    }

    if (end <= start) {
      field.report(
        'La date de fin doit être postérieure à la date de début',
        'invalidDateOrder',
        field
      )
      return
    }
  }
})

export const createSessionValidator = vine.compile(
  vine
    .object({
      description: vine.string().trim().optional(),
      duration: vine.number().optional(), // in seconds - optional, for effective work time
      endTime: vine.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z$/),
      startTime: vine.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z$/),
      taskId: vine.string().uuid(),
    })
    .use(sessionTimeValidator())
)

export const updateSessionValidator = vine.compile(
  vine.object({
    description: vine.string().trim().optional(),
    duration: vine.number().optional(),
    endTime: vine
      .string()
      .regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z$/)
      .optional(),
  })
)

export const getSessionsByDateValidator = vine.compile(
  vine.object({
    date: vine.string(),
  })
)

export const updateMultipleSessionsValidator = vine.compile(
  vine.object({
    sessions: vine.array(
      vine
        .object({
          description: vine.string().trim().optional(),
          duration: vine.number().optional(),
          endTime: vine.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z$/),
          id: vine.string().uuid().optional(),
          startTime: vine.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z$/),
          taskId: vine.string().uuid(),
        })
        .use(sessionTimeValidator())
    ),
  })
)
