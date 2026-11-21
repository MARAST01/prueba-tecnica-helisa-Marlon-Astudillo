import { Module } from '@nestjs/common';
import { CreateAccountUseCase } from './application/create-account.use-case.js';
import { DeleteAccountUseCase } from './application/delete-account.use-case.js';
import { GetAccountTreeUseCase } from './application/get-account-tree.use-case.js';
import { AccountRepository } from './domain/account.repository.js';
import { InMemoryAccountRepository } from './infrastructure/in-memory-account.repository.js';
import { AccountsController } from './presentation/accounts.controller.js';

@Module({
  controllers: [AccountsController],
  providers: [
    { provide: AccountRepository, useClass: InMemoryAccountRepository },
    CreateAccountUseCase,
    GetAccountTreeUseCase,
    DeleteAccountUseCase,
  ],
})
export class AccountsModule {}
