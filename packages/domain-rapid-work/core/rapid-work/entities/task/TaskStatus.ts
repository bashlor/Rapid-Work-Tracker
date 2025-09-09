export type TaskStatusValueType = 'cancelled' | 'completed' | 'in_progress' | 'pending'

export const TaskStatusEnumValues: Record<'Cancelled' | 'Completed' | 'InProgress' | 'Pending', TaskStatusValueType> = {
  Cancelled: 'cancelled',
  Completed: 'completed',
  InProgress: 'in_progress',
  Pending: 'pending',
} as const

export class TaskStatus {
  get value(): TaskStatusValueType {
    return this._value // Fixed: was returning this.value which caused infinite recursion
  }

  constructor(private readonly _value: TaskStatusValueType) {
    if (!TaskStatus.isValid(_value)) {
      throw new Error('Invalid task status')
    }
  }

  static create(value: TaskStatusValueType): TaskStatus {
    return new TaskStatus(value)
  }

  static isValid(value: TaskStatusValueType): boolean {
    return ['cancelled', 'completed', 'in_progress', 'pending'].includes(value)
  }
}