import { DateTime } from "../../../../kernel/datetime";
import { Email } from "../../../../kernel/email";
import { HashedPassword } from "../../../../kernel/hashed_password";
import { Id } from "../../../../kernel/id";
import { FullName } from "./FullName";
import { PlainPassword } from "./PlainPassword";

export interface UserData {
  createdAt: string;
  email: string;
  fullName: string;
  hashedPassword: string;
  id: string;
  plainPassword: string;
}

export class User {
  constructor(
    public readonly id: Id,
    public readonly email: Email,
    public readonly fullName: FullName,
    public readonly plainPassword: null | PlainPassword,
    public readonly hashedPassword: HashedPassword | null,
    public readonly createdAt: DateTime,
  ) {}


}

export function fromUserData(data: UserData): User {
  return new User(
    new Id(data.id),
    Email.createFrom(data.email),
    new FullName(data.fullName ?? 'User'),
    new PlainPassword(data.plainPassword),
    new HashedPassword(data.hashedPassword),
    new DateTime(data.createdAt),
  );
}

export function toUserData(user: User): UserData {
  return {
    createdAt: user.createdAt.toISOString(),
    email: user.email.value,
    fullName: user.fullName.value,
    hashedPassword: user.hashedPassword?.value ?? '',
    id: user.id.value,
    plainPassword: user.plainPassword?.value ?? '',
  };
}
