import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async down() {
    this.schema.dropTable(this.tableName)
  }

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('domain_id').notNullable().references('id').inTable('domains').onDelete('CASCADE')
      table
        .uuid('sub_domain_id')
        .nullable()
        .references('id')
        .inTable('subdomains')
        .onDelete('SET NULL')

      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('status').notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }
}
