import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../domain/account.repository.js';
import { DomainError } from '../domain/domain-error.js';

@Injectable()
export class DeleteAccountUseCase {
  constructor(private readonly accounts: AccountRepository) {}

  async execute(code: string): Promise<void> {
    if (!(await this.accounts.findByCode(code)))
      throw new DomainError('ACCOUNT_NOT_FOUND', `No existe la cuenta ${code}.`);
    if (await this.accounts.hasChildren(code))
      throw new DomainError(
        'HAS_CHILDREN',
        `No se puede eliminar la cuenta ${code} porque tiene cuentas hijas. Elimínalas primero.`,
      );
    await this.accounts.delete(code);
  }
}
