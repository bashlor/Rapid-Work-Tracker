import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'password_reset_tokens'

  async down() {
    this.schema.dropTable(this.tableName)
  }

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('value').notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }
}
