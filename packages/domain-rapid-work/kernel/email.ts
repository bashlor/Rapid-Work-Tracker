export class Email {
  get value(): string {
    return this._value.trim().toLowerCase();
  }

  constructor(private readonly _value: string) {}

  static create(value: string): Email {
    // create without validation but normalize
    return new Email(value.trim().toLowerCase());
  }

  static createFrom(value: string): Email {
    if (!Email.isValid(value)) {
      throw new Error('Invalid email');
    }
    return new Email(value.trim().toLowerCase());
  }

  static isValid(value: string): boolean {
    const v = (value ?? "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}