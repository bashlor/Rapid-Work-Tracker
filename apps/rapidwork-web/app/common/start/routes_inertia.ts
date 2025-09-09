import router from '@adonisjs/core/services/router'

import { middleware } from './kernel.js'

const LandingController = () => import('../../core/main/controllers/landing/landing_controller.js')
const HomeController = () => import('../../core/main/controllers/app/home_controller.js')
const LoginController = () => import('../../core/auth/controllers/login_controller.js')
const RegisterController = () => import('../../core/auth/controllers/register_controller.js')
const LogoutController = () => import('../../core/auth/controllers/logout_controller.js')
const UserWorkDataController = () =>
  import('../../core/main/controllers/app/user_work_data_controller.js')
const SessionController = () => import('../../core/main/controllers/app/session_controller.js')
const ChronometerController = () =>
  import('../../core/main/controllers/app/chronometer_controller.js')

// ---------------------------------------------------------------------------
// PUBLIC ROUTES (Inertia)
// ---------------------------------------------------------------------------
router.get('/', async ({ auth, inertia, response }) => {
  if (await auth.check()) {
    return response.redirect('/app/home')
  }
  return inertia.render('landing')
})
router.get('/landing', [LandingController, 'show']).as('landing')

// ---------------------------------------------------------------------------
// AUTHENTIFICATION (Inertia)
// ---------------------------------------------------------------------------
router
  .group(() => {
    router.get('/login', [LoginController, 'show']).as('login.show')
    router.post('/login', [LoginController, 'store']).as('login.store')
    router.get('/register', [RegisterController, 'show']).as('register.show')
    router.post('/register', [RegisterController, 'store']).as('register.store')
  })
  .prefix('/auth')
  .middleware(middleware.guest())

// Déconnexion (Inertia, protégé)
router.post('/logout', [LogoutController, 'store']).as('logout.show').middleware(middleware.auth())

// ---------------------------------------------------------------------------
// APPLICATION (Inertia, protégée)
// ---------------------------------------------------------------------------
router
  .group(() => {
    router.get('/', ({ response }) => response.redirect('/app/home'))
    router.get('/home', [HomeController, 'index']).as('home').as('home.show')
    router.get('/user_work_data', [UserWorkDataController, 'show']).as('user_work_data.show')
    router.get('/sessions', [SessionController, 'show']).as('sessions.show')
    router.get('/chronometer', [ChronometerController, 'show']).as('chronometer.show')
  })
  .prefix('/app')
  .middleware(middleware.auth())
