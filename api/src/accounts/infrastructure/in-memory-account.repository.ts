import { Injectable } from '@nestjs/common';
import { Account, type Nature } from '../domain/account.js';
import { AccountCode } from '../domain/account-code.js';
import { AccountRepository } from '../domain/account.repository.js';

const SEED: Array<[string, string, Nature]> = [
  ['1', 'Activo', 'debito'],
  ['11', 'Disponible', 'debito'],
  ['1105', 'Caja', 'debito'],
  ['110505', 'Caja general', 'debito'],
  ['110510', 'Caja menor', 'debito'],
  ['2', 'Pasivo', 'credito'],
  ['21', 'Obligaciones financieras', 'credito'],
  ['2105', 'Bancos nacionales', 'credito'],
];

@Injectable()
export class InMemoryAccountRepository extends AccountRepository {
  private readonly store = new Map<string, Account>(
    SEED.map(([code, name, nature]) => [code, new Account(AccountCode.create(code), name, nature)]),
  );

  async findAll() {
    return [...this.store.values()];
  }
  async findByCode(code: string) {
    return this.store.get(code) ?? null;
  }
  async hasChildren(code: string) {
    return [...this.store.values()].some((a) => a.code.parentValue === code);
  }
  async save(account: Account) {
    this.store.set(account.code.value, account);
  }
  async delete(code: string) {
    this.store.delete(code);
  }
}
