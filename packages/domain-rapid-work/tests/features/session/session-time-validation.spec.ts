import { test } from "@japa/runner"
import { TestContext } from "@japa/runner/core"

import { Session } from '../../../core/rapid-work/entities/session/Session'
import { DateTime } from '../../../kernel/datetime'
import { Description } from '../../../kernel/description'
import { Id } from '../../../kernel/id'

test.group('Session Time Validation', () => {
  test('should reject session with end time before start time', async (ctx: TestContext) => {
    const startTime = DateTime.fromISOString('2025-01-01T10:00:00Z')
    const endTime = DateTime.fromISOString('2025-01-01T09:00:00Z')

    ctx.assert.throws(() => {
      Session.create(
        Id.generate(),
        Id.generate(),
        Id.generate(),
        startTime,
        endTime,
        new Description('Test session')
      )
    })
  })

  test('should reject session with equal start and end times', async (ctx: TestContext) => {
    const time = DateTime.fromISOString('2025-01-01T10:00:00Z')

    ctx.assert.throws(() => {
      Session.create(
        Id.generate(),
        Id.generate(),
        Id.generate(),
        time,
        time,
        new Description('Test session')
      )
    })
  })

  test('should reject session with duration less than 1 minute', async (ctx: TestContext) => {
    const startTime = DateTime.fromISOString('2025-01-01T10:00:00Z')
    const endTime = DateTime.fromISOString('2025-01-01T10:00:30Z')

    ctx.assert.throws(() => {
      Session.create(
        Id.generate(),
        Id.generate(),
        Id.generate(),
        startTime,
        endTime,
        new Description('Test session')
      )
    })
  })

  test('should reject session with duration more than 24 hours', async (ctx: TestContext) => {
    const startTime = DateTime.fromISOString('2025-01-01T10:00:00Z')
    const endTime = DateTime.fromISOString('2025-01-02T11:00:00Z') // 25 hours

    ctx.assert.throws(() => {
      Session.create(
        Id.generate(),
        Id.generate(),
        Id.generate(),
        startTime,
        endTime,
        new Description('Test session')
      )
    })
  })

  test('should detect overlapping sessions', async (ctx: TestContext) => {
    const session1 = Session.create(
      Id.generate(),
      Id.generate(),
      Id.generate(),
      DateTime.fromISOString('2025-01-01T10:00:00Z'),
      DateTime.fromISOString('2025-01-01T11:00:00Z'),
      new Description('Session 1')
    )

    const session2 = Session.create(
      Id.generate(),
      Id.generate(),
      Id.generate(),
      DateTime.fromISOString('2025-01-01T10:30:00Z'),
      DateTime.fromISOString('2025-01-01T11:30:00Z'),
      new Description('Session 2')
    )

    ctx.assert.isTrue(session1.overlaps(session2))
  })

  test('should not detect overlap for adjacent sessions', async (ctx: TestContext) => {
    const session1 = Session.create(
      Id.generate(),
      Id.generate(),
      Id.generate(),
      DateTime.fromISOString('2025-01-01T10:00:00Z'),
      DateTime.fromISOString('2025-01-01T11:00:00Z'),
      new Description('Session 1')
    )

    const session2 = Session.create(
      Id.generate(),
      Id.generate(),
      Id.generate(),
      DateTime.fromISOString('2025-01-01T11:00:00Z'),
      DateTime.fromISOString('2025-01-01T12:00:00Z'),
      new Description('Session 2')
    )

    ctx.assert.isFalse(session1.overlaps(session2))
  })

  test('should calculate duration correctly', async (ctx: TestContext) => {
    const session = Session.create(
      Id.generate(),
      Id.generate(),
      Id.generate(),
      DateTime.fromISOString('2025-01-01T10:00:00Z'),
      DateTime.fromISOString('2025-01-01T11:30:00Z'),
      new Description('Test session')
    )

    ctx.assert.equal(session.getDuration().getMinutes(), 90)
    ctx.assert.equal(session.getDuration().toString(), '1h30min')
  })

  test('should create valid session with proper parameters', async (ctx: TestContext) => {
    const startTime = DateTime.fromISOString('2025-01-01T10:00:00Z')
    const endTime = DateTime.fromISOString('2025-01-01T11:00:00Z')
    
    const session = Session.create(
      Id.generate(),
      Id.generate(),
      Id.generate(),
      startTime,
      endTime,
      new Description('Valid session')
    )

    ctx.assert.isTrue(session.getStartTime().equals(startTime))
    ctx.assert.isTrue(session.getEndTime().equals(endTime))
    ctx.assert.equal(session.getDuration().getMinutes(), 60)
  })

  test('should check if session is on same day', async (ctx: TestContext) => {
    const session = Session.create(
      Id.generate(),
      Id.generate(),
      Id.generate(),
      DateTime.fromISOString('2025-01-01T10:00:00Z'),
      DateTime.fromISOString('2025-01-01T11:00:00Z'),
      new Description('Test session')
    )

    const sameDay = DateTime.fromISOString('2025-01-01T15:00:00Z')
    const differentDay = DateTime.fromISOString('2025-01-02T15:00:00Z')

    ctx.assert.isTrue(session.isOnDate(sameDay))
    ctx.assert.isFalse(session.isOnDate(differentDay))
  })
})
