import { Injectable } from '@nestjs/common';
import type { AccountLevel } from '../domain/account-code.js';
import type { Nature } from '../domain/account.js';
import { AccountRepository } from '../domain/account.repository.js';

export interface AccountNode {
  code: string;
  name: string;
  level: AccountLevel;
  nature: Nature;
  /** Regla 6: solo las cuentas sin hijas admiten movimientos. */
  acceptsMovements: boolean;
  children: AccountNode[];
}

@Injectable()
export class GetAccountTreeUseCase {
  constructor(private readonly accounts: AccountRepository) {}

  async execute(): Promise<AccountNode[]> {
    const all = (await this.accounts.findAll()).sort((a, b) => a.code.value.localeCompare(b.code.value));
    const nodes = new Map<string, AccountNode>();
    for (const a of all)
      nodes.set(a.code.value, {
        code: a.code.value,
        name: a.name,
        level: a.level,
        nature: a.nature,
        acceptsMovements: true,
        children: [],
      });

    const roots: AccountNode[] = [];
    for (const a of all) {
      const node = nodes.get(a.code.value)!;
      const parent = a.code.parentValue ? nodes.get(a.code.parentValue) : undefined;
      if (parent) {
        parent.children.push(node);
        parent.acceptsMovements = false;
      } else roots.push(node);
    }
    return roots;
  }
}
