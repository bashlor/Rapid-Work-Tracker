export class Label {
  get value(): string {
    return this._value;
  }

  private readonly _value: string;

  constructor(label: string) {
    if (!label || label.trim().length === 0) {
      throw new Error("Label cannot be empty");
    }
    if (label.length > 100) {
      throw new Error("Label cannot be longer than 100 characters");
    }
    this._value = label.trim();
  }

  equals(other: Label): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
