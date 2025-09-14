import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'domains'

  async down() {
    this.schema.dropTable(this.tableName)
  }

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('description').nullable()
      table.string('color').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }
}
