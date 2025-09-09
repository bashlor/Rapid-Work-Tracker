export class HashedPassword {
  get value(): string {
    return this._value;
  }

  constructor(private readonly _value: string) {}

  toString(): string {
    return this._value
  }
}