export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class InvalidStateTransitionError extends DomainError {
  constructor(fromStatus: string, action: string, details?: string) {
    super(
      `Invalid state transition: Cannot perform '${action}' on an attempt with status '${fromStatus}'.${
        details ? ' ' + details : ''
      }`
    );
  }
}

export class ValidationError extends DomainError {
  public errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.errors = errors;
  }
}

export class NotFoundError extends DomainError {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier '${identifier}' was not found.`);
  }
}
