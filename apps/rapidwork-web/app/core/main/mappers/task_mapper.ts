import { Task, TaskBuilder, TaskStatus } from 'domain-rapid-work'

export class TaskMapper {
  static fromDomain(task: Task): any {
    return {
      createdAt: new Date(task.createdAt.toISOString()),
      description: task.description.value,
      domainId: task.domainId ? task.domainId.value : null,
      id: task.id.value,
      status: task.status.value,
      subDomainId: task.subDomainId ? task.subDomainId.value : null,
      title: task.title.value,
      userId: task.userId.value,
    }
  }

  static toDomain(taskModel: any): null | Task {
    if (!taskModel) return null

    return new TaskBuilder()
      .withId(taskModel.id)
      .withUserId(taskModel.userId)
      .withTitle(taskModel.title)
      .withDescription(taskModel.description || '')
      .withDomainId(taskModel.domainId ? taskModel.domainId : null)
      .withSubDomainId(taskModel.subDomainId ? taskModel.subDomainId : null)
      .withStatus(TaskStatus.create(taskModel.status || 'pending'))
      .withCreatedAt(taskModel.createdAt.toISO())
      .build()
  }

  static toDomainArray(taskModels: any[]): Task[] {
    return taskModels
      .map((model) => this.toDomain(model))
      .filter((task): task is Task => task !== null)
  }
}
