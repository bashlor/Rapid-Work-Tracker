type DomainErrorTagType =
  | "already_exists"
  | "business_logic_error"
  | "forbidden"
  | "invalid_data"
  | "not_found"
  | "unauthorized_user_operation"
  | "unknown"
  | "unspecified_internal_error";

export class DomainError extends Error {
  cause?: unknown;
  exposeCause: boolean;
  type: DomainErrorTagType;

  constructor(
    message: string,
    tag: DomainErrorTagType = "unknown",
    name?: string,
    cause?: unknown,
    exposeCause = false,
  ) {
    super(message);
    this.name = name || "DomainError";
    this.cause = cause;
    this.type = tag;
    this.exposeCause = exposeCause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static fromMessage(
    message: string,
    tag?: DomainErrorTagType,
    name?: string,
    cause?: unknown,
  ): DomainError {
    return new DomainError(message, tag, name, cause);
  }
}
