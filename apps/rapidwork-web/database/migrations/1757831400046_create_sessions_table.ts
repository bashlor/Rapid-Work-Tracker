import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sessions'

  async down() {
    this.schema.dropTable(this.tableName)
  }

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('task_id').notNullable().references('id').inTable('tasks').onDelete('CASCADE')

      table.timestamp('start_time', { useTz: true }).notNullable()
      table.timestamp('end_time', { useTz: true }).notNullable()
      table.integer('duration').nullable()
      table.text('description').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }
}
