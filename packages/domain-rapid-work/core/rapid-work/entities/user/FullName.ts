

export class FullName {
  get value(): string {
    return this._value;
  }

  private readonly _value: string;

  constructor(value: string) {
    if (!FullName.isValid(value)) {
      throw new Error('Invalid full name')
    }
    this._value = value
  }

  static isValid(value: string): boolean {
    return value.length > 0 && value.length <= 100
  }

  equals(other: FullName): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}