import router from '@adonisjs/core/services/router'

import { middleware } from './kernel.js'

const LoginController = () => import('../../core/auth/controllers/login_controller.js')
const RegisterController = () => import('../../core/auth/controllers/register_controller.js')
const LogoutController = () => import('../../core/auth/controllers/logout_controller.js')
const DomainController = () => import('../../core/main/controllers/app/domain_controller.js')
const SubDomainController = () => import('../../core/main/controllers/app/subdomain_controller.js')
const TaskController = () => import('../../core/main/controllers/app/task_controller.js')
const SessionController = () => import('../../core/main/controllers/app/session_controller.js')
const DashboardController = () => import('../../core/main/controllers/app/dashboard_controller.js')

// ---------------------------------------------------------------------------
// API PUBLIQUE (auth)
// ---------------------------------------------------------------------------
router
  .group(() => {
    router.post('/auth/login', [LoginController, 'apiStore']).as('api.login')
    router.post('/auth/register', [RegisterController, 'apiStore']).as('api.register')
  })
  .prefix('/api')
  .middleware([middleware.forceJson(), middleware.guest()])

// ---------------------------------------------------------------------------
// API PROTÉGÉE
// ---------------------------------------------------------------------------
router
  .group(() => {
    router.post('/auth/logout', [LogoutController, 'apiStore']).as('api.logout')

    // Route pour le dashboard
    router.get('/dashboard', [DashboardController, 'index']).as('api.dashboard')

    router.post('/domains', [DomainController, 'createDomain']).as('api.domains.create')
    router.get('/domains', [DomainController, 'getDomains']).as('api.domains.get')
    router
      .delete('/domains/:domain_id', [DomainController, 'deleteDomain'])
      .as('api.domains.delete')
    router.patch('/domains/:domain_id', [DomainController, 'editDomain']).as('api.domains.edit')

    // Routes pour les sous-domaines
    router.post('/subdomains', [SubDomainController, 'createSubdomain']).as('api.subdomains.create')
    router
      .delete('/subdomains/:subdomain_id', [SubDomainController, 'deleteSubdomain'])
      .as('api.subdomains.delete')
    router
      .patch('/subdomains/:subdomain_id', [SubDomainController, 'editSubdomain'])
      .as('api.subdomains.edit')

    // Routes pour les tâches
    router.get('/tasks', [TaskController, 'index']).as('api.tasks.index')
    router.post('/tasks', [TaskController, 'create']).as('api.tasks.create')
    router.put('/tasks/:id', [TaskController, 'update']).as('api.tasks.update')
    router.delete('/tasks/:id', [TaskController, 'delete']).as('api.tasks.delete')
    router.get('/tasks/domain/:domainId', [TaskController, 'getByDomain']).as('api.tasks.byDomain')
    router
      .get('/tasks/subdomain/:subdomainId', [TaskController, 'getBySubdomain'])
      .as('api.tasks.bySubdomain')

    // Routes pour les sessions
    router.get('/sessions/by_date', [SessionController, 'getByDate']).as('api.sessions.by_date')
    router.post('/sessions', [SessionController, 'create']).as('api.sessions.create')
    router.put('/sessions/:id', [SessionController, 'update']).as('api.sessions.update')
    router
      .put('/sessions', [SessionController, 'updateMultiple'])
      .as('api.sessions.update_multiple')
    router.delete('/sessions/:id', [SessionController, 'delete']).as('api.sessions.delete')
  })
  .prefix('/api')
  .middleware([middleware.forceJson(), middleware.auth()])

// ---------------------------------------------------------------------------
// ROUTE CATCH-ALL POUR LES ROUTES API NON TROUVÉES (doit être en dernier)
// ---------------------------------------------------------------------------
router
  .any('/api/*', ({ response }) => {
    return response.status(404).json({
      code: 'ROUTE_NOT_FOUND',
      error: 'API endpoint not found',
      message: 'The requested API endpoint does not exist',
      success: false,
    })
  })
  .middleware([middleware.forceJson()])
