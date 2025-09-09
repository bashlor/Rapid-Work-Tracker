import { v7  } from 'uuid';

import { DateTime } from "../../../../kernel/datetime";
import { Email } from "../../../../kernel/email";
import { HashedPassword } from "../../../../kernel/hashed_password";
import { Id } from "../../../../kernel/id";
import { FullName } from "./FullName";
import { PlainPassword } from "./PlainPassword";
import { User } from "./User";

export class UserBuilder {
  private _createdAt: DateTime = DateTime.now();
  private _email: string = "";
  private _fullName: string = "";
  private _hashedPassword: string = "";
  private _id: string = "";
  private _plainPassword: string = "";

  build(): User {

    if(!this._id) {
      throw new Error("Id is required");
    }

    if (!this._email) {
      throw new Error("Email is required");
    }

    // Validate email format before proceeding
    try {
      Email.createFrom(this._email);
    } catch {
      throw new Error("Invalid email");
    }

    // Use default full name if not provided
    const fullName = this._fullName || 'User';
    
    if(!this._plainPassword && !this._hashedPassword) {
      throw new Error("PlainPassword or HashedPassword are required");
    }

    return new User(
      new Id(this._id),
      Email.createFrom(this._email),
      new FullName(fullName),
      this._plainPassword ? new PlainPassword(this._plainPassword) : null,
      this._hashedPassword ? new HashedPassword(this._hashedPassword) : null,
      this._createdAt,
    );
  }

  generateId(): UserBuilder {
    this._id = v7();
    return this;
  }

  withCreatedAt(createdAt: Date | string): UserBuilder {
    this._createdAt = new DateTime(createdAt);
    return this;
  }

  withEmail(email: string): UserBuilder {
    this._email = email;
    return this;
  }

  withFullName(fullName: string): UserBuilder {
    this._fullName = fullName;
    return this;
  }

  withHashedPassword(hashedPassword: string): UserBuilder {
    this._hashedPassword = hashedPassword;
    return this;
  }

  withId(id: string): UserBuilder {
    this._id = id;
    return this;
  }

  withPlainPassword(plainPassword: string): UserBuilder {
    this._plainPassword = plainPassword;
    return this;
  }
}
