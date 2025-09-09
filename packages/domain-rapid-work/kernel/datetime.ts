import { DateTime as LuxonDateTime } from 'luxon'

import { DomainError } from '../error/domain_error'

export class DateTime {
  private readonly value: LuxonDateTime

  constructor(value: Date | LuxonDateTime | string, timezone: string = 'UTC') {
    if (value instanceof LuxonDateTime) {
      this.value = value.setZone(timezone)
    } else if (typeof value === 'string') {
      // Try multiple parsing strategies
      this.value = this.parseStringValue(value, timezone)
    } else {
      this.value = LuxonDateTime.fromJSDate(value, { zone: timezone })
    }

    if (!this.value.isValid) {
      throw new DomainError(`Invalid date time value: ${this.value.invalidReason}`)
    }
  }

  static fromISOString(isoString: string, timezone: string = 'UTC'): DateTime {
    return new DateTime(LuxonDateTime.fromISO(isoString, { zone: timezone }))
  }

  static fromLocalDateTime(localDateTime: string, timezone: string = 'UTC'): DateTime {
    // Assume localDateTime is in format "YYYY-MM-DDTHH:mm"
    return new DateTime(LuxonDateTime.fromFormat(localDateTime, 'yyyy-MM-ddTHH:mm', { zone: timezone }))
  }

  static fromTimestamp(timestamp: number, timezone: string = 'UTC'): DateTime {
    return new DateTime(LuxonDateTime.fromMillis(timestamp, { zone: timezone }))
  }

  static now(timezone: string = 'UTC'): DateTime {
    return new DateTime(LuxonDateTime.now().setZone(timezone))
  }

  addDays(days: number): DateTime {
    return new DateTime(this.value.plus({ days }))
  }

  addHours(hours: number): DateTime {
    return new DateTime(this.value.plus({ hours }))
  }

  addMinutes(minutes: number): DateTime {
    return new DateTime(this.value.plus({ minutes }))
  }

  addSeconds(seconds: number): DateTime {
    return new DateTime(this.value.plus({ seconds }))
  }

  differenceInDays(other: DateTime): number {
    return Math.abs(this.value.diff(other.value, 'days').days)
  }

  differenceInHours(other: DateTime): number {
    return Math.abs(this.value.diff(other.value, 'hours').hours)
  }

  differenceInMinutes(other: DateTime): number {
    return Math.abs(this.value.diff(other.value, 'minutes').minutes)
  }

  differenceInSeconds(other: DateTime): number {
    return Math.abs(this.value.diff(other.value, 'seconds').seconds)
  }

  endOfDay(): DateTime {
    return new DateTime(this.value.endOf('day'))
  }

  equals(other: DateTime): boolean {
    return this.value.equals(other.value)
  }

  getTime(): number {
    return this.value.toMillis()
  }

  getTimezone(): string {
    return this.value.zoneName || 'UTC'
  }

  getValue(): Date {
    return this.value.toJSDate()
  }

  isAfter(other: DateTime): boolean {
    return this.value > other.value
  }

  isBefore(other: DateTime): boolean {
    return this.value < other.value
  }

  isEqual(other: DateTime): boolean {
    return this.value.equals(other.value)
  }

  isSameDay(other: DateTime): boolean {
    return this.value.hasSame(other.value, 'day')
  }

  startOfDay(): DateTime {
    return new DateTime(this.value.startOf('day'))
  }

  toDate(): Date {
    return this.value.toJSDate()
  }

  toISOString(): string {
    return this.value.toISO() || ''
  }

  toLocalDateTimeString(): string {
    // Format: "YYYY-MM-DDTHH:mm"
    return this.value.toFormat('yyyy-MM-ddTHH:mm')
  }

  toString(): string {
    return this.value.toISO() || ''
  }

  toTimezone(timezone: string): DateTime {
    return new DateTime(this.value.setZone(timezone))
  }

  private parseStringValue(value: string, timezone: string): LuxonDateTime {
    // Try ISO format first
    let parsed = LuxonDateTime.fromISO(value, { zone: timezone })
    if (parsed.isValid) return parsed

    // Try local datetime format
    parsed = LuxonDateTime.fromFormat(value, 'yyyy-MM-ddTHH:mm', { zone: timezone })
    if (parsed.isValid) return parsed

    // Try other common formats
    const formats = [
      'yyyy-MM-dd HH:mm:ss',
      'yyyy-MM-dd HH:mm',
      'dd/MM/yyyy HH:mm',
      'dd/MM/yyyy',
      'yyyy-MM-dd'
    ]

    for (const format of formats) {
      parsed = LuxonDateTime.fromFormat(value, format, { zone: timezone })
      if (parsed.isValid) return parsed
    }

    return parsed // Will be invalid, error will be thrown in constructor
  }
}
