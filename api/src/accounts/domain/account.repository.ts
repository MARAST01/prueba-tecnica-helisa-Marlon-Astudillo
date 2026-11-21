import type { Account } from './account.js';

/** Puerto: el dominio y los casos de uso dependen de esto, no de una base de datos. */
export abstract class AccountRepository {
  abstract findAll(): Promise<Account[]>;
  abstract findByCode(code: string): Promise<Account | null>;
  abstract hasChildren(code: string): Promise<boolean>;
  abstract save(account: Account): Promise<void>;
  abstract delete(code: string): Promise<void>;
}
