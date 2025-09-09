import { CreateTaskAction } from '#actions/tasks/create_task_action'
import { DeleteTaskAction } from '#actions/tasks/delete_task_action'
import { GetTasksAction } from '#actions/tasks/get_tasks_action'
import { GetTasksByDomainAction } from '#actions/tasks/get_tasks_by_domain_action'
import { GetTasksBySubdomainAction } from '#actions/tasks/get_tasks_by_subdomain_action'
import { UpdateTaskAction } from '#actions/tasks/update_task_action'
import { createTaskValidator } from '#validators/http_requests/create_task_validator'
import { deleteTaskValidator } from '#validators/http_requests/delete_task_validator'
import { updateTaskValidator } from '#validators/http_requests/update_task_validator'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { TaskStatus } from 'domain-rapid-work'

import { validateAndStrip } from '../../validators/http_responses/common.js'
import {
  deleteResultSchema,
  getTasksResponseSchema,
  taskWithRelationsDtoSchema,
} from '../../validators/http_responses/task_response.js'

@inject()
export default class TaskController {
  @inject()
  async create({ auth, request, response }: HttpContext, createTaskAction: CreateTaskAction) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    const data = await request.validateUsing(createTaskValidator)
    const viewModel = await createTaskAction.execute({
      description: data.description,
      domainId: data.domain_id,
      status: TaskStatus.create(data.status),
      subDomainId: data.subdomain_id,
      title: data.title,
      userId: user.id,
    })
    try {
      const body = await validateAndStrip(
        taskWithRelationsDtoSchema,
        viewModel.publicHttpJsonResponse
      )
      return response.status(201).json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }

  @inject()
  async delete({ auth, request, response }: HttpContext, deleteTaskAction: DeleteTaskAction) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    const data = await request.validateUsing(deleteTaskValidator)
    const viewModel = await deleteTaskAction.execute(data.params.id, user.id)
    try {
      const body = await validateAndStrip(deleteResultSchema, viewModel.publicHttpJsonResponse)
      return response.status(202).json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }

  @inject()
  async getByDomain(
    { auth, params, response }: HttpContext,
    getTasksByDomainAction: GetTasksByDomainAction
  ) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    const viewModel = await getTasksByDomainAction.execute(user.id, params.domainId)
    try {
      const body = await validateAndStrip(getTasksResponseSchema, viewModel.publicHttpJsonResponse)
      return response.json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }

  @inject()
  async getBySubdomain(
    { auth, params, response }: HttpContext,
    getTasksBySubdomainAction: GetTasksBySubdomainAction
  ) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    const viewModel = await getTasksBySubdomainAction.execute(user.id, params.subdomainId)
    try {
      const body = await validateAndStrip(getTasksResponseSchema, viewModel.publicHttpJsonResponse)
      return response.json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }

  @inject()
  async index({ auth, response }: HttpContext, getTasksAction: GetTasksAction) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    const viewModel = await getTasksAction.execute(user.id)
    try {
      const body = await validateAndStrip(getTasksResponseSchema, viewModel.publicHttpJsonResponse)
      return response.json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }

  @inject()
  async update({ auth, request, response }: HttpContext, updateTaskAction: UpdateTaskAction) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    const data = await request.validateUsing(updateTaskValidator)
    const viewModel = await updateTaskAction.execute({
      description: data.body.description,
      domainId: data.body.domain_id,
      status: TaskStatus.create(data.body.status),
      subDomainId: data.body.subdomain_id,
      taskId: data.params.id,
      title: data.body.title,
      userId: user.id,
    })
    try {
      const body = await validateAndStrip(
        taskWithRelationsDtoSchema,
        viewModel.publicHttpJsonResponse
      )
      return response.json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }
}
