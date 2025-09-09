import { CreateSubDomainAction } from '#actions/subdomains/create_subdomain_action'
import { DeleteSubDomainAction } from '#actions/subdomains/delete_subdomain_action'
import { EditSubDomainAction } from '#actions/subdomains/edit_subdomain_action'
import { createSubDomainValidator } from '#validators/http_requests/create_subdomain_validator'
import { deleteSubDomainValidator } from '#validators/http_requests/delete_subdomain_validator'
import { updateSubDomainValidator } from '#validators/http_requests/update_subdomain_validator'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import { validateAndStrip } from '../../validators/http_responses/common.js'
import { subdomainDtoSchema } from '../../validators/http_responses/domain_response.js'
import { deleteResultSchema } from '../../validators/http_responses/task_response.js'

@inject()
export default class SubDomainController {
  @inject()
  async createSubdomain(
    { auth, request, response }: HttpContext,
    createSubDomainAction: CreateSubDomainAction
  ) {
    const user = auth.user

    if (!user) {
      throw new Error('User not found')
    }

    const data = await request.validateUsing(createSubDomainValidator)

    const viewModel = await createSubDomainAction.execute(data.name, data.domain_id, user.id)
    try {
      const body = await validateAndStrip(subdomainDtoSchema, viewModel.publicHttpJsonResponse)
      return response.json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }

  @inject()
  async deleteSubdomain(
    { auth, request, response }: HttpContext,
    deleteSubDomainAction: DeleteSubDomainAction
  ) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }
    const data = await request.validateUsing(deleteSubDomainValidator)

    const viewModel = await deleteSubDomainAction.execute(user.id, data.params.subdomain_id)
    try {
      const body = await validateAndStrip(deleteResultSchema, viewModel.publicHttpJsonResponse)
      return response.status(202).json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }

  @inject()
  async editSubdomain(
    { auth, request, response }: HttpContext,
    editSubDomainAction: EditSubDomainAction
  ) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    const data = await request.validateUsing(updateSubDomainValidator)
    const viewModel = await editSubDomainAction.execute(
      user.id,
      data.params.subdomain_id,
      data.name
    )
    try {
      const body = await validateAndStrip(subdomainDtoSchema, viewModel.publicHttpJsonResponse)
      return response.json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }

  // Add method to get user work data with tasks
  @inject()
  async getUserWorkData(
    { auth, inertia }: HttpContext
    // Add task action injection here if needed
  ) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    // Get domains with subdomains
    // const domains = await getDomains logic here

    // Get tasks for user
    // const tasks = await getTasks logic here

    return inertia.render('UserWorkData', {
      // domains,
      // tasks,
      // ...other props
    })
  }
}
