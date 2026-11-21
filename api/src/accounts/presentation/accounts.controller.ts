import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseFilters } from '@nestjs/common';
import { CreateAccountUseCase } from '../application/create-account.use-case.js';
import { DeleteAccountUseCase } from '../application/delete-account.use-case.js';
import { GetAccountTreeUseCase } from '../application/get-account-tree.use-case.js';
import { DomainErrorFilter } from './domain-error.filter.js';

type CreateAccountBody = { code?: unknown; name?: unknown; nature?: unknown };

@Controller('accounts')
@UseFilters(DomainErrorFilter)
export class AccountsController {
  constructor(
    private readonly createAccount: CreateAccountUseCase,
    private readonly getTree: GetAccountTreeUseCase,
    private readonly deleteAccount: DeleteAccountUseCase,
  ) {}

  @Get()
  tree() {
    return this.getTree.execute();
  }

  @Post()
  async create(@Body() body: CreateAccountBody) {
    const account = await this.createAccount.execute(body ?? {});
    return { code: account.code.value, name: account.name, level: account.level, nature: account.nature };
  }

  @Delete(':code')
  @HttpCode(204)
  async remove(@Param('code') code: string) {
    await this.deleteAccount.execute(code);
  }
}
