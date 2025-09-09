export class Description {
  get value(): string {
    return this._value;
  }

  private readonly _value: string;

  constructor(description: null | string | undefined) {
    if (!description) {
      this._value = "";
      return;
    }

    if (description.length > 1000) {
      throw new Error("Description cannot be longer than 1000 characters");
    }
    this._value = description.trim();
  }

  equals(other: Description): boolean {
    return this._value === other._value;
  }

  isEmpty(): boolean {
    return this._value.length === 0;
  }

  toString(): string {
    return this._value;
  }
}
