import { CreateDomainAction } from '#actions/domain/create_domain_action'
import { DeleteDomainAction } from '#actions/domain/delete_domain_action'
import { EditDomainAction } from '#actions/domain/edit_domain_action'
import { GetDomainsAction } from '#actions/domain/get_domains_actions'
import { createDomainValidator } from '#validators/http_requests/create_domain_validator'
import { deleteDomainValidator } from '#validators/http_requests/delete_domain_validator'
import { updateDomainValidator } from '#validators/http_requests/update_domain_validator'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import { validateAndStrip } from '../../validators/http_responses/common.js'
import {
  domainWithSubdomainsDtoSchema,
  getDomainsResponseSchema,
} from '../../validators/http_responses/domain_response.js'

@inject()
export default class DomainController {
  @inject()
  async createDomain(
    { auth, request, response }: HttpContext,
    createDomainAction: CreateDomainAction
  ) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }
    const data = await request.validateUsing(createDomainValidator)

    const viewModel = await createDomainAction.execute(data.name, user.id)
    try {
      const body = await validateAndStrip(
        domainWithSubdomainsDtoSchema,
        viewModel.publicHttpJsonResponse()
      )
      return response.json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }

  @inject()
  async deleteDomain(
    { auth, request, response }: HttpContext,
    deleteDomainAction: DeleteDomainAction
  ) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }
    const data = await request.validateUsing(deleteDomainValidator)

    const viewModel = await deleteDomainAction.execute(user.id, data.params.domain_id)
    return response.status(202).json(viewModel.publicHttpJsonResponse())
  }

  @inject()
  async editDomain({ auth, request, response }: HttpContext, editDomainAction: EditDomainAction) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    const data = await request.validateUsing(updateDomainValidator)
    const viewModel = await editDomainAction.execute(user.id, data.params.domain_id, data.name)
    try {
      const body = await validateAndStrip(
        domainWithSubdomainsDtoSchema,
        viewModel.publicHttpJsonResponse()
      )
      return response.json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }

  @inject()
  async getDomains({ auth, response }: HttpContext, getDomainsAction: GetDomainsAction) {
    const user = auth.user
    if (!user) {
      throw new Error('User not found')
    }

    const viewModel = await getDomainsAction.execute(user.id)
    try {
      const body = await validateAndStrip(
        getDomainsResponseSchema,
        viewModel.publicHttpJsonResponse()
      )
      return response.json(body)
    } catch (error) {
      return response.badRequest({ error: 'Invalid response format' })
    }
  }
}
