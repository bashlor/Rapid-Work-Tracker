import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { MigrationRunner } from '@adonisjs/lucid/migration'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { Email, UserCollection } from 'domain-rapid-work'

import { RegisterAction } from '../../../app/core/auth/actions/register_action.js'
import { LucidUserRepository } from '../../../app/repositories/lucid_user_repository.js'

test.group('Register Controller - HTTP Integration', (group) => {
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

  test('should successfully register a new user via HTTP', async ({ assert, client, route }) => {
    // Arrange
    const userData = {
      email: 'test@example.com',
      full_name: 'Test User',
      password: 'password123',
      password_confirmation: 'password123',
    }

    // Act - Make JSON API request using the dedicated API route
    const response = await client
      .post(route('api.register'))
      .json(userData)
      .header('Accept', 'application/json')
      .withCsrfToken()

    // Assert
    const status = response.status()
    const body = response.body()

    assert.equal(status, 201)
    assert.equal(response.body().success, true)

    // Verify user was created in database
    const createdUser = await userRepository.findByEmail(new Email(userData.email))

    assert.equal(createdUser?.email.value, userData.email)
    assert.equal(createdUser?.fullName.value, userData.full_name)
    assert.equal(createdUser?.id.value, body.user.id)
  })

  test('should reject registration with existing email via HTTP', async ({
    assert,
    client,
    route,
  }) => {
    // Arrange - Create a user first
    const existingUserData = {
      email: 'existing@example.com',
      full_name: 'Existing User',
      password: 'password123',
      password_confirmation: 'password123',
    }

    await registerAction.execute(existingUserData)

    // Try to register with same email
    const duplicateUserData = {
      email: 'existing@example.com',
      full_name: 'Another User',
      password: 'differentpassword',
      password_confirmation: 'differentpassword',
    }

    // Act - Test JSON API response for duplicate email
    const response = await client
      .post(route('api.register'))
      .json(duplicateUserData)
      .header('Accept', 'application/json')
      .withCsrfToken()

    // Assert
    const status = response.status()
    const body = response.body()

    assert.equal(status, 400) // Bad request for duplicate email
    assert.equal(body.success, false)
    assert.exists(body.error)
    assert.include(body.error, 'An account with this email already exists')
  })

  test('should validate required fields for registration via HTTP', async ({
    assert,
    client,
    route,
  }) => {
    // Arrange - Missing email
    const incompleteData = {
      fullName: 'Test User',
      password: 'password123',
      // email missing
    }

    // Act
    const response = await client
      .post(route('api.register'))
      .json(incompleteData)
      .header('Accept', 'application/json')
      .withCsrfToken()

    // Assert
    const status = response.status()

    assert.equal(status, 422) // Validation error

    const body = response.body()
    assert.exists(body.errors)
    assert.isArray(body.errors)

    // Should have error for email field
    const emailError = body.errors.find((error: any) => error.message.field === 'email')
    assert.exists(emailError)
  })

  test('should validate email format for registration via HTTP', async ({
    assert,
    client,
    route,
  }) => {
    // Arrange
    const invalidEmailData = {
      email: 'invalid-email-format',
      fullName: 'Test User',
      password: 'password123',
    }

    // Act
    const response = await client
      .post(route('api.register'))
      .json(invalidEmailData)
      .header('Accept', 'application/json')
      .withCsrfToken()

    // Assert
    const status = response.status()
    const body = response.body()

    assert.equal(status, 422)
    assert.exists(body.errors)
    assert.isArray(body.errors)

    // Should have validation error for email format
    const emailError = body.errors.find((error: any) => error.message.field === 'email')
    assert.exists(emailError)
    assert.include(emailError.message.message.toLowerCase(), 'email')
  })

  test('should return 422 when Accept header is missing', async ({ assert, client, route }) => {
    // Arrange
    const userData = {
      email: 'test@example.com',
      fullName: 'Test User',
      password: 'password123',
    }

    // Act - Make request WITHOUT Accept header
    const response = await client.post(route('api.register')).json(userData).withCsrfToken()

    // Assert
    const status = response.status()
    const body = response.body()

    assert.equal(status, 422)
    assert.equal(body.success, false)
    assert.equal(body.code, 'INVALID_ACCEPT_HEADER')
    assert.include(body.error, 'Accept header')
  })
})
