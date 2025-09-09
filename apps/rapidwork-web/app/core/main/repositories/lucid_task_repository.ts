import TaskModel from '#models/task'
import { Id, TaskCollection, Task as TaskEntity } from 'domain-rapid-work'

import { TaskMapper } from '../mappers/task_mapper.js'

export class LucidTaskRepository extends TaskCollection {
  async delete(userId: Id, id: Id): Promise<boolean> {
    const task = await TaskModel.query().where('id', id.value).where('userId', userId.value).first()
    if (!task) return false
    await task.delete()
    return true
  }

  async getAllByDomainId(userId: Id, domainId: Id): Promise<TaskEntity[]> {
    const tasks = await TaskModel.query()
      .where('domainId', domainId.value)
      .where('userId', userId.value)
    return TaskMapper.toDomainArray(tasks)
  }

  async getAllBySubDomainId(userId: Id, subDomainId: Id): Promise<TaskEntity[]> {
    const tasks = await TaskModel.query()
      .where('subDomainId', subDomainId.value)
      .where('userId', userId.value)
    return TaskMapper.toDomainArray(tasks)
  }

  async getAllByUserId(userId: Id): Promise<TaskEntity[]> {
    const tasks = await TaskModel.query().where('userId', userId.value)
    return TaskMapper.toDomainArray(tasks)
  }

  async getById(userId: Id, id: Id): Promise<null | TaskEntity> {
    const task = await TaskModel.query().where('id', id.value).where('userId', userId.value).first()
    return TaskMapper.toDomain(task)
  }

  async insert(taskEntity: TaskEntity): Promise<TaskEntity> {
    const taskModelData = TaskMapper.fromDomain(taskEntity)
    const task = await TaskModel.create({
      description: taskModelData.description,
      domainId: taskModelData.domainId,
      id: taskModelData.id,
      status: taskModelData.status,
      subDomainId: taskModelData.subDomainId,
      title: taskModelData.title,
      userId: taskModelData.userId,
    })
    return TaskMapper.toDomain(task)!
  }

  async update(taskEntity: TaskEntity): Promise<TaskEntity> {
    const task = await TaskModel.findOrFail(taskEntity.id.value)
    const taskData = TaskMapper.fromDomain(taskEntity)
    task.merge({
      description: taskData.description,
      domainId: taskData.domainId,
      status: taskData.status,
      subDomainId: taskData.subDomainId,
      title: taskData.title,
    })
    await task.save()
    return TaskMapper.toDomain(task)!
  }
}
