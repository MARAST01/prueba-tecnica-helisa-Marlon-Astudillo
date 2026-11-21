export type DomainErrorType =
  | 'VALIDATION'
  | 'DUPLICATE_CODE'
  | 'PARENT_NOT_FOUND'
  | 'ACCOUNT_NOT_FOUND'
  | 'HAS_CHILDREN';

export interface FieldError {
  field?: string;
  message: string;
}

/** Error de negocio. No conoce HTTP: la capa de presentación lo traduce. */
export class DomainError extends Error {
  readonly type: DomainErrorType;
  readonly errors: FieldError[];

  constructor(type: DomainErrorType, message: string, errors: FieldError[] = []) {
    super(message);
    this.name = 'DomainError';
    this.type = type;
    this.errors = errors;
  }
}
