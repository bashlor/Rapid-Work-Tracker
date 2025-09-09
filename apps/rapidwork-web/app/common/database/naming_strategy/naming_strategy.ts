import string from '@adonisjs/core/helpers/string'
import { BaseModel } from '@adonisjs/lucid/orm'
import { CamelCaseNamingStrategy } from '@adonisjs/lucid/orm'

export class CustomNamingStrategy extends CamelCaseNamingStrategy {
  /**
   * Convert model property names to snake_case for database columns
   */
  columnName(_model: typeof BaseModel, propertyName: string) {
    return string.snakeCase(propertyName)
  }

  /**
   * Generate foreign key names in camelCase for model properties
   * but they will be converted to snake_case in the database
   */
  relationForeignKey(relation: string, model: typeof BaseModel, relatedModel: typeof BaseModel) {
    if (relation === 'belongsTo') {
      return string.camelCase(`${relatedModel.name}_${relatedModel.primaryKey}`)
    }

    return string.camelCase(`${model.name}_${model.primaryKey}`)
  }

  /**
   * Keep camelCase for serialization (JSON output)
   */
  serializedName(_model: typeof BaseModel, propertyName: string) {
    return propertyName // Keep camelCase for JSON
  }
}
