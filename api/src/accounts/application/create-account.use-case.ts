import { Injectable } from '@nestjs/common';
import { Account, isNature, type Nature } from '../domain/account.js';
import { AccountCode } from '../domain/account-code.js';
import { AccountRepository } from '../domain/account.repository.js';
import { DomainError, type FieldError } from '../domain/domain-error.js';

export interface CreateAccountInput {
  code?: unknown;
  name?: unknown;
  nature?: unknown;
}

const MAX_NAME_LENGTH = 60;

@Injectable()
export class CreateAccountUseCase {
  constructor(private readonly accounts: AccountRepository) {}

  async execute(input: CreateAccountInput): Promise<Account> {
    const errors: FieldError[] = [];

    const codeError = AccountCode.validate(input.code);
    if (codeError) errors.push({ field: 'code', message: codeError });
    const code = codeError ? null : AccountCode.create(input.code as string);

    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (!name) errors.push({ field: 'name', message: 'El nombre es obligatorio.' });
    else if (name.length > MAX_NAME_LENGTH)
      errors.push({ field: 'name', message: `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres.` });

    if (code?.level === 'clase' && !isNature(input.nature))
      errors.push({ field: 'nature', message: 'La clase requiere una naturaleza: débito o crédito.' });

    if (errors.length > 0 || !code) throw new DomainError('VALIDATION', 'Hay datos inválidos.', errors);

    if (await this.accounts.findByCode(code.value))
      throw new DomainError('DUPLICATE_CODE', `Ya existe una cuenta con el código ${code.value}.`, [
        { field: 'code', message: `Ya existe una cuenta con el código ${code.value}.` },
      ]);

    let nature: Nature;
    if (code.parentValue === null) {
      nature = input.nature as Nature;
    } else {
      const parent = await this.accounts.findByCode(code.parentValue);
      if (!parent) {
        const message = `No existe la cuenta padre ${code.parentValue}. Créala primero.`;
        throw new DomainError('PARENT_NOT_FOUND', message, [{ field: 'code', message }]);
      }
      nature = parent.nature; // regla 8: se hereda
    }

    const account = new Account(code, name, nature);
    await this.accounts.save(account);
    return account;
  }
}
