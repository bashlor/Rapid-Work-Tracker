


export class PlainPassword {
  get value(): string {
    return this._value;
  }

  constructor(private readonly _value: string) {}

  static create(value: string): PlainPassword {
    return new PlainPassword(value);
  }

  toString(): string {
    return this._value;
  }
}