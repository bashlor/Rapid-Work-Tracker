// Centralized date/time helpers for consistent parsing/formatting and timezone handling
// Conventions
// - API boundary: UTC ISO strings (with Z), e.g. 2025-01-24T08:00:00.000Z
// - UI input boundary: HTML datetime-local strings (local, no timezone), e.g. 2025-01-24T09:00
// - Display: Intl.DateTimeFormat with locale/timeZone options

import { Duration, DateTime as Lx } from 'luxon'

export const DEFAULT_LOCALE = 'fr-FR'
// Set to a specific IANA TZ like 'Europe/Paris' to force display in that zone,
// or leave undefined to use the user's local timezone.
export const DEFAULT_TIME_ZONE: string | undefined = 'Europe/Paris'

// =============================================================================
// CALENDAR & DATE UTILITIES (remplace date-fns)
// =============================================================================

export function addDays(date: Date | string, days: number): Date {
  const dt = typeof date === 'string' ? Lx.fromISO(date) : Lx.fromJSDate(date)
  return dt.plus({ days }).toJSDate()
}

// Helpers for local datetime-local math and validation
export function addMinutesToLocalInput(localInput: string, minutes: number): string {
  const dt = Lx.fromFormat(localInput, "yyyy-LL-dd'T'HH:mm:ss", { zone: 'local' })
  const dtNoSec = Lx.fromFormat(localInput, "yyyy-LL-dd'T'HH:mm", { zone: 'local' })
  const picked = dt.isValid ? dt : dtNoSec
  if (!picked.isValid) return localInput
  return picked.plus({ minutes }).toFormat("yyyy-LL-dd'T'HH:mm")
}

export function calculateDurationBetweenDates(startTime: string, endTime: string): number {
  const start = Lx.fromISO(startTime)
  const end = Lx.fromISO(endTime)
  if (!start.isValid || !end.isValid) return 0
  return end.diff(start, 'seconds').seconds
}

export function convertSecondsToReadableTime(seconds: number): string {
  return formatDurationFromSeconds(seconds)
}

export function differenceInMinutes(end: Date | string, start: Date | string): number {
  const endDt = typeof end === 'string' ? Lx.fromISO(end) : Lx.fromJSDate(end)
  const startDt = typeof start === 'string' ? Lx.fromISO(start) : Lx.fromJSDate(start)
  return Math.floor(endDt.diff(startDt, 'minutes').minutes)
}

export function diffMinutesBetweenLocalInputs(startLocal: string, endLocal: string): number {
  const s = Lx.fromFormat(startLocal, "yyyy-LL-dd'T'HH:mm", { zone: 'local' })
  const e = Lx.fromFormat(endLocal, "yyyy-LL-dd'T'HH:mm", { zone: 'local' })
  if (!s.isValid || !e.isValid) return Number.NaN
  return Math.floor(e.diff(s, 'minutes').minutes)
}

export function eachDayOfInterval(interval: { end: Date; start: Date }): Date[] {
  const start = Lx.fromJSDate(interval.start)
  const end = Lx.fromJSDate(interval.end)
  const days: Date[] = []

  let current = start
  while (current <= end) {
    days.push(current.toJSDate())
    current = current.plus({ days: 1 })
  }

  return days
}

export function endOfWeek(date: Date | string, options?: { weekStartsOn?: number }): Date {
  const start = startOfWeek(date, options)
  return addDays(start, 6)
}

// Format function with French locale support
export function format(
  date: Date | string,
  formatStr: string,
  _options?: { locale?: string }
): string {
  const dt = typeof date === 'string' ? Lx.fromISO(date) : Lx.fromJSDate(date)

  // Convert date-fns format patterns to Luxon patterns
  const luxonFormat = formatStr
    .replace(/EEEE/g, 'cccc') // Full weekday name
    .replace(/EEE/g, 'ccc') // Short weekday name
    .replace(/MMMM/g, 'LLLL') // Full month name
    .replace(/MMM/g, 'LLL') // Short month name
    .replace(/MM/g, 'LL') // Month number with leading zero
    .replace(/dd/g, 'dd') // Day with leading zero
    .replace(/d/g, 'd') // Day without leading zero
    .replace(/yyyy/g, 'yyyy') // Full year
    .replace(/HH/g, 'HH') // Hour 24h with leading zero
    .replace(/mm/g, 'mm') // Minutes with leading zero

  return dt.setLocale('fr').toFormat(luxonFormat)
}

// Format a Date or date-like input to a readable string using Intl
export function formatDateTimeDisplay(
  value: Date | string,
  opts?: { format?: string; locale?: string; timeZone?: string }
): string {
  const locale = opts?.locale || DEFAULT_LOCALE
  const zone = opts?.timeZone || DEFAULT_TIME_ZONE || undefined
  const fmt = opts?.format || 'dd LLLL yyyy, HH:mm'
  const dt =
    typeof value === 'string'
      ? Lx.fromISO(value, { zone: zone || 'local' })
      : Lx.fromJSDate(value).setZone(zone || 'local')
  if (!dt.isValid) return String(value)
  return dt.setLocale(locale).toFormat(fmt)
}

export function formatDuration(milliseconds: number): string {
  const duration = Duration.fromMillis(milliseconds)
  const hours = Math.floor(duration.as('hours'))
  const minutes = Math.floor(duration.as('minutes') % 60)

  if (hours === 0) {
    return `${minutes}min`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h${minutes}min`
}

export function formatDurationFromMinutes(minutes: number): string {
  const duration = Duration.fromObject({ minutes })
  const hours = Math.floor(duration.as('hours'))
  const mins = Math.floor(duration.as('minutes') % 60)

  if (hours === 0) {
    return `${mins}min`
  }
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h${mins}min`
}

export function formatDurationFromSeconds(seconds: number): string {
  // Normalize to milliseconds first
  let totalSeconds = seconds
  if (seconds > 86400) {
    totalSeconds = Math.floor(seconds / 1000)
  }

  const duration = Duration.fromObject({ seconds: totalSeconds })
  const hours = Math.floor(duration.as('hours'))
  const minutes = Math.floor(duration.as('minutes') % 60)

  if (hours === 0) {
    return `${minutes}min`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h${minutes}min`
}

export function formatTimeDisplay(
  value: Date | string,
  opts?: { format?: string; locale?: string; timeZone?: string }
): string {
  return formatDateTimeDisplay(value, { ...opts, format: opts?.format || 'HH:mm' })
}

export function formatTimeRange(
  start: Date | string,
  end: Date | string,
  opts?: Intl.DateTimeFormatOptions & { locale?: string; timeZone?: string }
): string {
  const s = formatTimeDisplay(start, opts)
  const e = formatTimeDisplay(end, opts)
  return `${s} - ${e}`
}

export function isEndAfterStartLocal(startLocal?: string, endLocal?: string): boolean {
  if (!startLocal || !endLocal) return false
  const diff = diffMinutesBetweenLocalInputs(startLocal, endLocal)
  return Number.isFinite(diff) && diff > 0
}

// =============================================================================
// ORIGINAL DATETIME UTILITIES (preservées)
// =============================================================================

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const dt1 = typeof date1 === 'string' ? Lx.fromISO(date1) : Lx.fromJSDate(date1)
  const dt2 = typeof date2 === 'string' ? Lx.fromISO(date2) : Lx.fromJSDate(date2)
  return dt1.hasSame(dt2, 'day')
}

export function isToday(date: Date | string): boolean {
  const dt = typeof date === 'string' ? Lx.fromISO(date) : Lx.fromJSDate(date)
  return dt.hasSame(Lx.now(), 'day')
}

export function isValidDate(d: Date) {
  return d instanceof Date && !Number.isNaN(d.getTime())
}

// Convert local datetime-local string (yyyy-MM-ddTHH:mm[:ss]) to UTC ISO string
export function localInputToUtcIso(localInput?: null | string): string {
  if (!localInput) return ''
  const dt = Lx.fromFormat(localInput, "yyyy-LL-dd'T'HH:mm:ss", { zone: 'local' })
  const dtNoSec = Lx.fromFormat(localInput, "yyyy-LL-dd'T'HH:mm", { zone: 'local' })
  const picked = dt.isValid ? dt : dtNoSec
  if (!picked.isValid) return ''
  return picked.toUTC().toISO()
}

// Duration formatters
export function minutesToReadableFr(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m}min`
}

export function normalizeDuration(
  duration: number,
  sourceFormat: 'milliseconds' | 'minutes' | 'seconds' = 'milliseconds'
): number {
  const dur = Duration.fromObject({ [sourceFormat]: duration })
  return dur.as('milliseconds')
}

// Parse ISO string (replaces parseISO from date-fns)
export function parseISO(dateString: string): Date {
  const dt = Lx.fromISO(dateString)
  return dt.toJSDate()
}

export function parseTimeToMinutes(time: string): number {
  // Format HH:mm
  if (/^\d{2}:\d{2}$/.test(time)) {
    const dt = Lx.fromFormat(time, 'HH:mm')
    if (dt.isValid) {
      return dt.hour * 60 + dt.minute
    }
  }

  // Format ISO
  const dt = Lx.fromISO(time)
  if (dt.isValid) {
    return dt.hour * 60 + dt.minute
  }

  // Fallback: try to parse as HH:mm manually
  try {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  } catch {
    return 0
  }
}

export function startOfWeek(date: Date | string, options?: { weekStartsOn?: number }): Date {
  const dt = typeof date === 'string' ? Lx.fromISO(date) : Lx.fromJSDate(date)
  const weekStartsOn = options?.weekStartsOn ?? 1 // Default to Monday
  return dt
    .startOf('week')
    .plus({ days: weekStartsOn - 1 })
    .toJSDate()
}

export function toLocalDateInput(date: Date): string {
  return Lx.fromJSDate(date).toFormat('yyyy-LL-dd')
}

// Convert UTC ISO (with Z) to local datetime-local string (yyyy-MM-ddTHH:mm)
export function utcIsoToLocalInput(isoUtc?: null | string, withSeconds = false): string {
  if (!isoUtc) return ''
  const dt = Lx.fromISO(isoUtc, { zone: 'utc' }).toLocal()
  if (!dt.isValid) return ''
  return withSeconds ? dt.toFormat("yyyy-LL-dd'T'HH:mm:ss") : dt.toFormat("yyyy-LL-dd'T'HH:mm")
}
