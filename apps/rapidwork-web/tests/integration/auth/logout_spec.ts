import { LucidUserRepository } from '#auth/repositories/lucid_user_repository'
import UserModel from '#models/user'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { MigrationRunner } from '@adonisjs/lucid/migration'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { UserCollection } from 'domain-rapid-work'

import { LoginAction } from '../../../app/core/auth/actions/login_action.js'
import { LogoutAction } from '../../../app/core/auth/actions/logout_action.js'
import { RegisterAction } from '../../../app/core/auth/actions/register_action.js'

test.group('Logout Controller - API Integration', (group) => {
  let postgresContainer: StartedPostgreSqlContainer
  let userRepository: LucidUserRepository

  let closeServer: () => Promise<void>

  group.each.setup(async () => {
    // Initialize the AdonisJS application
    await app.init()
    await app.boot()

    // Start the HTTP server for testing
    closeServer = await testUtils.httpServer().start()
  })

  group.each.setup(async () => {
    // Start PostgreSQL test container
    postgresContainer = await new PostgreSqlContainer('postgres:16')
      .withDatabase('rapidwork_test')
      .withUsername('test_user')
      .withPassword('test_password')
      .start()

    // Override database configuration
    app.config.set('database.connections.postgres.connection', {
      database: postgresContainer.getDatabase(),
      host: postgresContainer.getHost(),
      password: postgresContainer.getPassword(),
      port: postgresContainer.getPort(),
      user: postgresContainer.getUsername(),
    })

    // Reconnect with new configuration
    await db.manager.closeAll()

    // Run migrations on test database using MigrationRunner
    const migrator = new MigrationRunner(db, app, {
      direction: 'up',
      dryRun: false,
    })

    await migrator.run()

    // Initialize domain services
    userRepository = new LucidUserRepository()
    app.container.swap(UserCollection, () => userRepository)

    await app.container.make(RegisterAction)
    await app.container.make(LoginAction)
    await app.container.make(LogoutAction)

    // Cleanup function
    return async () => {
      if (db.manager.isConnected('postgres')) {
        await db.manager.closeAll()
      }
      if (postgresContainer) {
        await postgresContainer.stop()
      }
      if (closeServer) {
        await closeServer()
      }
    }
  })

  test('should successfully logout when authenticated', async ({ assert, client, route }) => {
    // Arrange - Create and login a user first
    const userData = {
      email: 'test@example.com',
      fullName: 'Test User',
      id: '0198d77b-3fa5-762b-8098-129672d29ec5',
      password: 'password123',
    }

    const user = await UserModel.create(userData)

    // Login first to get authenticated session
    const loginResponse = await client
      .post(route('api.login'))
      .loginAs(user)
      .header('Accept', 'application/json')
      .withCsrfToken()

    assert.equal(loginResponse.status(), 200)

    // Act - Logout using the same client instance (cookies should be maintained automatically)
    const response = await client
      .post(route('api.logout'))
      .header('Accept', 'application/json')
      .loginAs(user)
      .withCsrfToken()

    // Assert
    const status = response.status()
    const body = response.body()

    assert.equal(status, 200)
    assert.equal(body.success, true)
    assert.equal(body.message, 'You have been logged out successfully')
  })
})
