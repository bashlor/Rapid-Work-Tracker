import SessionModel from '#models/session'
import db from '@adonisjs/lucid/services/db'
import { DateTime, Id, SessionCollection, Session as SessionEntity } from 'domain-rapid-work'
import { DateTime as DateTimeLuxon } from 'luxon'

import { SessionMapper } from '../mappers/session_mapper.js'

export class LucidSessionRepository extends SessionCollection {
  async delete(userId: Id, id: Id): Promise<boolean> {
    const session = await SessionModel.query()
      .where('id', id.value)
      .where('userId', userId.value)
      .first()
    if (!session) return false
    await session.delete()
    return true
  }

  async findByUserAndDateRange(
    userId: Id,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<SessionEntity[]> {
    const sessions = await SessionModel.query()
      .where('userId', userId.value)
      .whereBetween('startTime', [startDate.toISOString(), endDate.toISOString()])
    return SessionMapper.toDomainArray(sessions)
  }

  async findOverlappingSessions(
    userId: Id,
    startTime: DateTime,
    endTime: DateTime,
    excludeSessionId?: Id
  ): Promise<SessionEntity[]> {
    let query = SessionModel.query()
      .where('userId', userId.value)
      .where('startTime', '<', endTime.toISOString())
      .where('endTime', '>', startTime.toISOString())

    if (excludeSessionId) {
      query = query.whereNot('id', excludeSessionId.value)
    }

    const sessions = await query
    return SessionMapper.toDomainArray(sessions)
  }

  async getAllBetweenDates(
    userId: Id,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<SessionEntity[]> {
    const sessions = await SessionModel.query()
      .where('userId', userId.value)
      .whereBetween('startTime', [startDate.toISOString(), endDate.toISOString()])
    return SessionMapper.toDomainArray(sessions)
  }

  async getAllByTaskId(userId: Id, taskId: Id): Promise<SessionEntity[]> {
    const sessions = await SessionModel.query()
      .where('taskId', taskId.value)
      .where('userId', userId.value)
    return SessionMapper.toDomainArray(sessions)
  }

  async getAllByUserId(userId: Id): Promise<SessionEntity[]> {
    const sessions = await SessionModel.query().where('userId', userId.value)
    return SessionMapper.toDomainArray(sessions)
  }

  async getById(userId: Id, id: Id): Promise<null | SessionEntity> {
    const session = await SessionModel.query()
      .where('id', id.value)
      .where('userId', userId.value)
      .first()
    return SessionMapper.toDomain(session)
  }

  async save(sessionEntity: SessionEntity): Promise<void> {
    const sessionModelData = SessionMapper.fromDomain(sessionEntity)
    await SessionModel.create({
      description: sessionModelData.description,
      duration: sessionModelData.duration,
      endTime: DateTimeLuxon.fromISO(sessionModelData.endTime).startOf('second'),
      id: sessionModelData.id,
      startTime: DateTimeLuxon.fromISO(sessionModelData.startTime).startOf('second'),
      taskId: sessionModelData.taskId,
      userId: sessionModelData.userId,
    })
  }

  async update(sessionEntity: SessionEntity): Promise<SessionEntity> {
    const session = await SessionModel.findOrFail(sessionEntity.getId().value)
    const sessionData = SessionMapper.fromDomain(sessionEntity)
    session.merge({
      description: sessionData.description,
      duration: sessionData.duration,
      endTime: DateTimeLuxon.fromISO(sessionData.endTime).startOf('second'),
      startTime: DateTimeLuxon.fromISO(sessionData.startTime).startOf('second'),
    })
    await session.save()
    return SessionMapper.toDomain(session)!
  }

  async updateMultiple(sessions: SessionEntity[]): Promise<void> {
    // Utiliser une transaction pour assurer l'atomicité
    await db.transaction(async (trx) => {
      for (const sessionEntity of sessions) {
        const sessionData = SessionMapper.fromDomain(sessionEntity)

        // Vérifier si la session existe déjà
        const existingSession = await SessionModel.query({ client: trx })
          .where('id', sessionEntity.getId().value)
          .first()

        if (existingSession) {
          // Mettre à jour la session existante
          existingSession.merge({
            description: sessionData.description,
            duration: sessionData.duration,
            endTime: DateTimeLuxon.fromISO(sessionData.endTime).startOf('second'),
            startTime: DateTimeLuxon.fromISO(sessionData.startTime).startOf('second'),
            taskId: sessionData.taskId,
          })
          await existingSession.save()
        } else {
          // Créer une nouvelle session
          await SessionModel.create(
            {
              description: sessionData.description,
              duration: sessionData.duration,
              endTime: DateTimeLuxon.fromISO(sessionData.endTime).startOf('second'),
              id: sessionData.id,
              startTime: DateTimeLuxon.fromISO(sessionData.startTime).startOf('second'),
              taskId: sessionData.taskId,
              userId: sessionData.userId,
            },
            { client: trx }
          )
        }
      }
    })
  }
}
