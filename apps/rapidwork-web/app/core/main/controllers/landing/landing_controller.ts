import type { HttpContext } from '@adonisjs/core/http'

export default class LandingController {
  async show({ auth, inertia, response }: HttpContext) {
    // Check if user is authenticated
    if (await auth.check()) {
      return response.redirect('/app/home')
    }
    // Show landing page for non-authenticated users
    return inertia.render('landing')
  }
}
