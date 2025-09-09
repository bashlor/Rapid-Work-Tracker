import { Email } from "../../../kernel/email";
import { Id } from "../../../kernel/id";
import { User } from "../entities/user/User";

export abstract class UserCollection {
  abstract create(data: User): Promise<User>;
  abstract delete(id: Id): Promise<boolean>;
  abstract existsByEmail(email: Email): Promise<boolean>;
  abstract findByEmail(email: Email): Promise<null | User>;
  abstract findById(id: Id): Promise<null | User>;
  abstract update(
    id: Id,
    data: User,
  ): Promise<User>;
}
