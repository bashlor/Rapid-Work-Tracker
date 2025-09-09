import { DomainError } from "../../../error/domain_error";

export class ActiveSessionAlreadyExistsError extends DomainError {
  constructor(userId: string) {
    super(`User with ID ${userId} already has an active session`);
    Object.setPrototypeOf(this, ActiveSessionAlreadyExistsError.prototype);
  }
}

// Domaine / Sous-domaine
export class CannotDeleteDomainWithTasksError extends DomainError {
  constructor(domainId: string) {
    super(
      `Cannot delete domain with ID ${domainId} because it is referenced by one or more tasks`,
    );
    Object.setPrototypeOf(this, CannotDeleteDomainWithTasksError.prototype);
  }
}

export class CannotDeleteSubDomainWithTasksError extends DomainError {
  constructor({ domainId, subDomainId }: { domainId?: string; subDomainId?: string }) {
    super(
      `Operation failed. ${domainId ? `Domain with ID ${domainId} is referenced by one or more sub-domains` : ''} 
      ${subDomainId ? `Sub-domain with ID ${subDomainId} is referenced by one or more tasks` : ''}`,
    );
    Object.setPrototypeOf(this, CannotDeleteSubDomainWithTasksError.prototype);
  }
}

export class DomainNotFoundError extends DomainError {
  constructor(domainId: string) {
    super(`Domain with ID ${domainId} not found`);
    Object.setPrototypeOf(this, DomainNotFoundError.prototype);
  }
}

export class InvalidSessionTimeRangeError extends DomainError {
  constructor() {
    super(`Session end time must be after start time`);
    Object.setPrototypeOf(this, InvalidSessionTimeRangeError.prototype);
  }
}

export class InvalidSubDomainWithoutDomainError extends DomainError {
  constructor(subDomainId: string) {
    super(`Sub-domain with ID ${subDomainId} must be linked to a domain`);
    Object.setPrototypeOf(this, InvalidSubDomainWithoutDomainError.prototype);
  }
}

export class NoActiveSessionError extends DomainError {
  constructor(userId: string) {
    super(`No active session found for user with ID ${userId}`);
    Object.setPrototypeOf(this, NoActiveSessionError.prototype);
  }
}

// Session
export class SessionMustBeLinkedToTaskError extends DomainError {
  constructor() {
    super(`Session must be linked to a task`);
    Object.setPrototypeOf(this, SessionMustBeLinkedToTaskError.prototype);
  }
}

export class SubDomainNotFoundError extends DomainError {
  constructor(subDomainId: string) {
    super(`Sub-domain with ID ${subDomainId} not found`);
    Object.setPrototypeOf(this, SubDomainNotFoundError.prototype);
  }
}

export class TaskDoesNotExistError extends DomainError {
  constructor(taskId: string) {
    super(`Task with ID ${taskId} does not exist`);
    Object.setPrototypeOf(this, TaskDoesNotExistError.prototype);
  }
}

// Tâche
export class TaskMustBeLinkedToDomainOrSubDomainError extends DomainError {
  constructor() {
    super(`Task must be linked to either a domain or a sub-domain`);
    Object.setPrototypeOf(
      this,
      TaskMustBeLinkedToDomainOrSubDomainError.prototype,
    );
  }
}

export class TaskNotFoundError extends DomainError {
  constructor(taskId: string) {
    super(`Task with ID ${taskId} not found`);
    Object.setPrototypeOf(this, TaskNotFoundError.prototype);
  }
}

export class UnauthorizedTaskAccessError extends DomainError {
  constructor() {
    super(`Unauthorized: Task does not belong to the user`);
    Object.setPrototypeOf(this, UnauthorizedTaskAccessError.prototype);
  }
}
