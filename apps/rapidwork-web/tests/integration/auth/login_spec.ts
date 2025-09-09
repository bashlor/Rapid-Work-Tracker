import { LucidUserRepository } from '#auth/repositories/lucid_user_repository'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { MigrationRunner } from '@adonisjs/lucid/migration'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { UserCollection } from 'domain-rapid-work'

import { LoginAction } from '../../../app/core/auth/actions/login_action.js'
import { RegisterAction } from '../../../app/core/auth/actions/register_action.js'

test.group('Login Controller - API Integration', (group) => {
  let postgresContainer: StartedPostgreSqlContainer
  let userRepository: LucidUserRepository
  let registerAction: RegisterAction
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

    registerAction = await app.container.make(RegisterAction)
    await app.container.make(LoginAction)

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

  test('should successfully login with valid credentials', async ({ assert, client, route }) => {
    // Arrange - Create a user first
    const userData = {
      email: 'test@example.com',
      full_name: 'Test User',
      password: 'password123',
    }

    await registerAction.execute(userData)

    const loginData = {
      email: userData.email,
      password: userData.password,
    }

    // Act
    const response = await client
      .post(route('api.login'))
      .json(loginData)
      .header('Accept', 'application/json')
      .withCsrfToken()

    // Assert
    const status = response.status()
    const body = response.body()

    assert.equal(status, 200)
    assert.equal(body.success, true)
    assert.equal(body.message, 'User authenticated successfully')
    assert.exists(body.user)
    assert.equal(body.user.email, userData.email)
  })

  test('should fail login with wrong password', async ({ assert, client, route }) => {
    // Arrange - Create a user first
    const userData = {
      email: 'test@example.com',
      full_name: 'Test User',
      password: 'password123',
    }

    await registerAction.execute(userData)

    const loginData = {
      email: userData.email,
      password: 'wrongpassword',
    }

    // Act
    const response = await client
      .post(route('api.login'))
      .json(loginData)
      .header('Accept', 'application/json')
      .withCsrfToken()

    // Assert
    const status = response.status()
    const body = response.body()

    assert.equal(status, 401)
    assert.equal(body.success, false)
    assert.exists(body.error)
  })

  test('should fail login with non-existent email', async ({ assert, client, route }) => {
    // Arrange
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'password123',
    }

    // Act
    const response = await client
      .post(route('api.login'))
      .json(loginData)
      .header('Accept', 'application/json')
      .withCsrfToken()

    // Assert
    const status = response.status()
    const body = response.body()

    assert.equal(status, 401)
    assert.equal(body.success, false)
    assert.exists(body.error)
  })
})
