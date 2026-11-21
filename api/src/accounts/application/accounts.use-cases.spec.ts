import { DomainError } from '../domain/domain-error.js';
import { InMemoryAccountRepository } from '../infrastructure/in-memory-account.repository.js';
import { CreateAccountUseCase } from './create-account.use-case.js';
import { DeleteAccountUseCase } from './delete-account.use-case.js';
import { GetAccountTreeUseCase } from './get-account-tree.use-case.js';

const setup = () => {
  const repo = new InMemoryAccountRepository();
  return {
    create: new CreateAccountUseCase(repo),
    tree: new GetAccountTreeUseCase(repo),
    remove: new DeleteAccountUseCase(repo),
  };
};

async function errorType(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    return 'NO_ERROR';
  } catch (e) {
    return e instanceof DomainError ? e.type : 'UNEXPECTED';
  }
}

describe('crear cuenta', () => {
  it('rechaza código no numérico y longitud inválida', async () => {
    const { create } = setup();
    expect(await errorType(create.execute({ code: '11a', name: 'x' }))).toBe('VALIDATION');
    expect(await errorType(create.execute({ code: '123', name: 'x' }))).toBe('VALIDATION');
  });

  it('rechaza códigos duplicados y padres inexistentes', async () => {
    const { create } = setup();
    expect(await errorType(create.execute({ code: '1105', name: 'x' }))).toBe('DUPLICATE_CODE');
    expect(await errorType(create.execute({ code: '3105', name: 'x' }))).toBe('PARENT_NOT_FOUND');
  });

  it('exige naturaleza en las clases y la hereda en el resto', async () => {
    const { create } = setup();
    expect(await errorType(create.execute({ code: '3', name: 'Patrimonio' }))).toBe('VALIDATION');
    expect((await create.execute({ code: '3', name: 'Patrimonio', nature: 'credito' })).nature).toBe('credito');
    expect((await create.execute({ code: '2106', name: 'Bancos extranjeros' })).nature).toBe('credito');
  });
});

describe('consultar y eliminar', () => {
  it('arma el árbol y marca qué cuentas admiten movimientos', async () => {
    const { tree } = setup();
    const roots = await tree.execute();
    expect(roots.map((r) => r.code)).toEqual(['1', '2']);
    const caja = roots[0]!.children[0]!.children[0]!;
    expect(caja.acceptsMovements).toBe(false);
    expect(caja.children.every((c) => c.acceptsMovements)).toBe(true);
  });

  it('no elimina cuentas con hijas, pero sí hojas', async () => {
    const { remove } = setup();
    expect(await errorType(remove.execute('1105'))).toBe('HAS_CHILDREN');
    await remove.execute('110505');
    expect(await errorType(remove.execute('110505'))).toBe('ACCOUNT_NOT_FOUND');
  });
});
