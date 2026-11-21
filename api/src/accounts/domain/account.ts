import { AccountCode, type AccountLevel } from './account-code.js';

export type Nature = 'debito' | 'credito';

export function isNature(value: unknown): value is Nature {
  return value === 'debito' || value === 'credito';
}

export class Account {
  constructor(
    readonly code: AccountCode,
    readonly name: string,
    readonly nature: Nature,
  ) {}

  get level(): AccountLevel {
    return this.code.level;
  }
}
