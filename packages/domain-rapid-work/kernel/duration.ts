import { Duration as LuxonDuration } from 'luxon'

import { DomainError } from '../error/domain_error'

export class Duration {
  get minutes(): number {
    return this.getMinutes()
  }

  private readonly value: LuxonDuration

  constructor(minutes: number) {
    if (minutes < 0) {
      throw new DomainError('Duration cannot be negative')
    }
    // Allow fractional minutes for more precision
    this.value = LuxonDuration.fromObject({ minutes })
  }

  static fromDateRange(start: Date, end: Date): Duration {
    const diffMs = end.getTime() - start.getTime()
    if (diffMs < 0) {
      throw new DomainError('End date must be after start date')
    }
    // Convert to fractional minutes for precision
    const minutes = diffMs / (1000 * 60)
    return new Duration(minutes)
  }

  static fromHours(hours: number): Duration {
    return new Duration(hours * 60)
  }

  static fromHoursAndMinutes(hours: number, minutes: number): Duration {
    if (hours < 0 || minutes < 0 || minutes >= 60) {
      throw new DomainError('Invalid hours or minutes')
    }
    return new Duration(hours * 60 + minutes)
  }

  static fromMilliseconds(milliseconds: number): Duration {
    return new Duration(milliseconds / (1000 * 60))
  }

  static fromMinutes(minutes: number): Duration {
    return new Duration(minutes)
  }

  static fromSeconds(seconds: number): Duration {
    // Preserve precision by converting to fractional minutes
    return new Duration(seconds / 60)
  }

  add(other: Duration): Duration {
    const totalMinutes = this.getMinutes() + other.getMinutes()
    return new Duration(totalMinutes)
  }

  equals(other: Duration): boolean {
    return this.getMinutes() === other.getMinutes()
  }

  getHours(): number {
    return this.value.as('hours')
  }

  getIntegerHours(): number {
    return Math.floor(this.value.as('hours'))
  }

  getIntegerMinutes(): number {
    return Math.floor(this.value.as('minutes'))
  }

  getMilliseconds(): number {
    return this.value.as('milliseconds')
  }

  getMinutes(): number {
    return this.value.as('minutes')
  }

  getRemainingMinutes(): number {
    return Math.floor(this.value.as('minutes')) % 60
  }

  getSeconds(): number {
    return this.value.as('seconds')
  }

  isGreaterThan(other: Duration): boolean {
    return this.getMinutes() > other.getMinutes()
  }

  isLessThan(other: Duration): boolean {
    return this.getMinutes() < other.getMinutes()
  }

  subtract(other: Duration): Duration {
    const result = this.getMinutes() - other.getMinutes()
    if (result < 0) {
      throw new DomainError('Cannot subtract duration that would result in negative time')
    }
    return new Duration(result)
  }

  toDetailedString(): string {
    const hours = this.getIntegerHours()
    const minutes = this.getRemainingMinutes()
    
    const parts = []
    if (hours > 0) {
      parts.push(`${hours} heure${hours > 1 ? 's' : ''}`)
    }
    if (minutes > 0) {
      parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
    }
    
    return parts.length > 0 ? parts.join(', ') : '0 minute'
  }

  toPreciseString(): string {
    const totalMinutes = this.getMinutes()
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    if (hours === 0) {
      return `${minutes.toFixed(1)}min`
    }
    
    return `${hours}h${minutes.toFixed(1)}min`
  }

  toString(): string {
    const hours = this.getIntegerHours()
    const minutes = this.getRemainingMinutes()
    
    if (hours === 0) {
      return `${minutes}min`
    }
    
    if (minutes === 0) {
      return `${hours}h`
    }
    
    return `${hours}h${minutes}min`
  }
}
