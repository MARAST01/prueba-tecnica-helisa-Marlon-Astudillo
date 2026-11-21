import { type ArgumentsHost, Catch, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError, type DomainErrorType } from '../domain/domain-error.js';

const STATUS: Record<DomainErrorType, number> = {
  VALIDATION: 400,
  ACCOUNT_NOT_FOUND: 404,
  DUPLICATE_CODE: 409,
  HAS_CHILDREN: 409,
  PARENT_NOT_FOUND: 422,
};

/** Traduce errores de dominio a HTTP con forma estable: { statusCode, type, message, errors[] }. */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const statusCode = STATUS[error.type];
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(statusCode)
      .json({ statusCode, type: error.type, message: error.message, errors: error.errors });
  }
}
