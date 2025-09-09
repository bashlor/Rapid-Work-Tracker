import { validate as isValidUUID, v7 } from 'uuid';

export class Id {
  get value(): string {
    return this._value;
  }

  private readonly _value: string;

  constructor(id: string) {
    if (!id || id.trim().length === 0) {
      throw new Error("ID cannot be empty");
    }

    if(!isValidUUID(id)) {
      throw new Error(`ID : ${id} is not a valid UUID`);
    }

    this._value = id;
  }

  static generate(): Id {
    return new Id(v7())
  }

  equals(other: Id): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
