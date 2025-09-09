import type { ApplicationService } from '@adonisjs/core/types'

import { BaseModel } from '@adonisjs/lucid/orm'
import {
  CreateDomainFeature,
  CreateSessionFeature,
  CreateSubDomainFeature,
  CreateTaskFeature,
  DeleteDomainFeature,
  DeleteSessionFeature,
  DeleteSubDomainFeature,
  DeleteTaskFeature,
  EditDomainFeature,
  GetDomainsFeature,
  GetSessionsByDateFeature,
  GetSessionsFeature,
  GetTasksFeature,
  GetUserDataDashboardFeature,
  UpdateMultipleSessionsFeature,
  UpdateSessionFeature,
  UpdateSubDomainFeature,
  UpdateTaskFeature,
} from 'domain-rapid-work'

import { CustomNamingStrategy } from '../database/naming_strategy/naming_strategy.js'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  // Utiliser boot() pour les imports dynamiques
  async boot() {
    // Configure global naming strategy
    BaseModel.namingStrategy = new CustomNamingStrategy()

    // Import des repositories
    const { LucidDomainRepository } = await import('#repositories/lucid_domain_repository')
    const { LucidUserRepository } = await import('#auth/repositories/lucid_user_repository')
    const { LucidSessionRepository } = await import('#repositories/lucid_session_repository')
    const { LucidTaskRepository } = await import('#repositories/lucid_task_repository')
    const { LucidSubDomainRepository } = await import('#repositories/lucid_subdomain_repository')

    // Import des collections abstraites
    const {
      DomainCollection,
      SessionCollection,
      SubDomainCollection,
      TaskCollection,
      UserCollection,
    } = await import('domain-rapid-work')

    // Binding des repositories aux collections
    this.app.container.bind(DomainCollection, () => {
      return this.app.container.make(LucidDomainRepository)
    })

    this.app.container.bind(UserCollection, () => {
      return this.app.container.make(LucidUserRepository)
    })

    this.app.container.bind(SessionCollection, () => {
      return this.app.container.make(LucidSessionRepository)
    })

    this.app.container.bind(TaskCollection, () => {
      return this.app.container.make(LucidTaskRepository)
    })

    this.app.container.bind(SubDomainCollection, () => {
      return this.app.container.make(LucidSubDomainRepository)
    })

    // Binding des features
    this.app.container.bind(CreateDomainFeature, async () => {
      const domainCollection = await this.app.container.make(DomainCollection)
      const subDomainCollection = await this.app.container.make(SubDomainCollection)
      return new CreateDomainFeature(domainCollection, subDomainCollection)
    })

    this.app.container.bind(GetDomainsFeature, async () => {
      const domainCollection = await this.app.container.make(DomainCollection)
      return new GetDomainsFeature(domainCollection)
    })

    this.app.container.bind(EditDomainFeature, async () => {
      const domainCollection = await this.app.container.make(DomainCollection)
      const subDomainCollection = await this.app.container.make(SubDomainCollection)
      return new EditDomainFeature(domainCollection, subDomainCollection)
    })

    this.app.container.bind(DeleteDomainFeature, async () => {
      const domainCollection = await this.app.container.make(DomainCollection)
      const subDomainCollection = await this.app.container.make(SubDomainCollection)
      const taskCollection = await this.app.container.make(TaskCollection)
      return new DeleteDomainFeature(domainCollection, subDomainCollection, taskCollection)
    })

    this.app.container.bind(CreateSubDomainFeature, async () => {
      const subDomainCollection = await this.app.container.make(SubDomainCollection)
      const domainCollection = await this.app.container.make(DomainCollection)
      return new CreateSubDomainFeature(subDomainCollection, domainCollection)
    })

    this.app.container.bind(UpdateSubDomainFeature, async () => {
      const subDomainCollection = await this.app.container.make(SubDomainCollection)
      return new UpdateSubDomainFeature(subDomainCollection)
    })

    this.app.container.bind(DeleteSubDomainFeature, async () => {
      const subDomainCollection = await this.app.container.make(SubDomainCollection)
      const taskCollection = await this.app.container.make(TaskCollection)
      return new DeleteSubDomainFeature(subDomainCollection, taskCollection)
    })

    // Binding des features de tâches
    this.app.container.bind(CreateTaskFeature, async () => {
      const taskCollection = await this.app.container.make(TaskCollection)
      const domainCollection = await this.app.container.make(DomainCollection)
      const subDomainCollection = await this.app.container.make(SubDomainCollection)
      return new CreateTaskFeature(taskCollection, domainCollection, subDomainCollection)
    })

    this.app.container.bind(GetTasksFeature, async () => {
      const taskCollection = await this.app.container.make(TaskCollection)
      return new GetTasksFeature(taskCollection)
    })

    this.app.container.bind(UpdateTaskFeature, async () => {
      const taskCollection = await this.app.container.make(TaskCollection)
      const domainCollection = await this.app.container.make(DomainCollection)
      const subDomainCollection = await this.app.container.make(SubDomainCollection)
      return new UpdateTaskFeature(taskCollection, domainCollection, subDomainCollection)
    })

    this.app.container.bind(DeleteTaskFeature, async () => {
      const taskCollection = await this.app.container.make(TaskCollection)
      return new DeleteTaskFeature(taskCollection)
    })

    // Binding des features de sessions
    this.app.container.bind(CreateSessionFeature, async () => {
      const sessionCollection = await this.app.container.make(SessionCollection)
      return new CreateSessionFeature(sessionCollection)
    })

    this.app.container.bind(UpdateSessionFeature, async () => {
      const sessionCollection = await this.app.container.make(SessionCollection)
      return new UpdateSessionFeature(sessionCollection)
    })

    this.app.container.bind(DeleteSessionFeature, async () => {
      const sessionCollection = await this.app.container.make(SessionCollection)
      return new DeleteSessionFeature(sessionCollection)
    })

    this.app.container.bind(GetSessionsFeature, async () => {
      const sessionCollection = await this.app.container.make(SessionCollection)
      return new GetSessionsFeature(sessionCollection)
    })

    this.app.container.bind(GetSessionsByDateFeature, async () => {
      const sessionCollection = await this.app.container.make(SessionCollection)
      return new GetSessionsByDateFeature(sessionCollection)
    })

    this.app.container.bind(UpdateMultipleSessionsFeature, async () => {
      const sessionCollection = await this.app.container.make(SessionCollection)
      return new UpdateMultipleSessionsFeature(sessionCollection)
    })

    // Binding de la feature Dashboard
    this.app.container.bind(GetUserDataDashboardFeature, async () => {
      const sessionCollection = await this.app.container.make(SessionCollection)
      const taskCollection = await this.app.container.make(TaskCollection)
      const domainCollection = await this.app.container.make(DomainCollection)
      const subDomainCollection = await this.app.container.make(SubDomainCollection)
      const userCollection = await this.app.container.make(UserCollection)
      return new GetUserDataDashboardFeature(
        sessionCollection,
        taskCollection,
        domainCollection,
        subDomainCollection,
        userCollection
      )
    })
  }
}
