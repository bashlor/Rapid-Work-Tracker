import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ChronometerController {
  async show({ inertia }: HttpContext) {
    return inertia.render('chronometer')
  }
}
