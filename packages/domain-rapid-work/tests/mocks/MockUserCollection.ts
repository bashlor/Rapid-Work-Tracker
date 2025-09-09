import { UserCollection } from "../../core/rapid-work/collections/UserCollection";
import { FullName } from "../../core/rapid-work/entities/user/FullName";
import { User } from "../../core/rapid-work/entities/user/User";
import { DateTime } from "../../kernel/datetime";
import { Email } from "../../kernel/email";
import { HashedPassword } from "../../kernel/hashed_password";
import { Id } from "../../kernel/id";
import { generateUUIDv7 } from "../helpers/uuid-helper";

export class MockUserCollection extends UserCollection {
  private users: User[] = [];

  // Helper methods for testing
  clear(): void {
    this.users = [];
  }

  async create(userOrData: User | { email: Email; fullName: null | string; password: string; }): Promise<User> {
    // If a User instance is provided, use it
    if ((userOrData as User).id) {
      const user = userOrData as User;
      const id = user.id || new Id(generateUUIDv7());
      const newUser = new User(
        id,
        user.email,
        user.fullName,
        user.plainPassword,
        user.hashedPassword,
        user.createdAt,
      );

      this.users.push(newUser);
      return newUser;
    }

    // Otherwise construct from provided data shape used in tests
    const data = userOrData as { email: Email; fullName: null | string; password: string };
    const id = new Id(generateUUIDv7());
    // Lazy import to avoid circular issues if any
    const fullName = data.fullName ? new (await import("../../core/rapid-work/entities/user/FullName")).FullName(data.fullName) : new (await import("../../core/rapid-work/entities/user/FullName")).FullName('User');
    const HashedPassword = (await import("../../kernel/hashed_password")).HashedPassword;
    const DateTime = (await import("../../kernel/datetime")).DateTime;

    const newUser = new User(
      id,
      data.email,
      fullName,
      null,
      new HashedPassword(data.password),
      new DateTime(new Date().toISOString()),
    );

    this.users.push(newUser);
    return newUser;
  }

  // Helper to create user easily in tests
  async createFromData(data: {
    email: Email;
    fullName: null | string;
    password: string;
  }): Promise<User> {
    const id = new Id(generateUUIDv7());
    const user = new User(
      id,
      data.email,
      new FullName(data.fullName || 'User'),
      null, // plainPassword
      new HashedPassword(data.password),
      new DateTime(new Date().toISOString()),
    );

    this.users.push(user);
    return user;
  }

  async delete(id: Id): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id.value === id.value);
    if (index === -1) {
      return false;
    }
    this.users.splice(index, 1);
    return true;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return this.users.some((u) => u.email.equals(email));
  }

  async findByEmail(email: Email): Promise<null | User> {
    return this.users.find((u) => u.email.equals(email)) || null;
  }

  async findById(id: Id): Promise<null | User> {
    return this.users.find((u) => u.id.value === id.value) || null;
  }

  getAll(): User[] {
    return [...this.users];
  }

  async update(id: Id, data: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id.value === id.value);
    if (index === -1) {
      throw new Error("User not found");
    }
    this.users[index] = data;
    return data;
  }
}
