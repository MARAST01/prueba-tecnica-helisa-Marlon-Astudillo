export type AccountLevel = 'clase' | 'grupo' | 'cuenta' | 'subcuenta';

const LEVEL_BY_LENGTH: Readonly<Record<number, AccountLevel>> = {
  1: 'clase',
  2: 'grupo',
  4: 'cuenta',
  6: 'subcuenta',
};
const PARENT_LENGTH: Readonly<Record<number, number>> = { 2: 1, 4: 2, 6: 4 };

/** Value object: encapsula formato, nivel y código del padre (reglas 1–3). */
export class AccountCode {
  private constructor(readonly value: string) {}

  /** Devuelve el mensaje de error, o null si el código es válido. */
  static validate(raw: unknown): string | null {
    if (typeof raw !== 'string' || raw.trim() === '') return 'El código es obligatorio.';
    const value = raw.trim();
    if (!/^\d+$/.test(value)) return 'El código solo puede contener dígitos.';
    if (!(value.length in LEVEL_BY_LENGTH)) return 'El código debe tener 1, 2, 4 o 6 dígitos.';
    return null;
  }

  static create(raw: string): AccountCode {
    const error = AccountCode.validate(raw);
    if (error) throw new Error(error);
    return new AccountCode(raw.trim());
  }

  get level(): AccountLevel {
    return LEVEL_BY_LENGTH[this.value.length]!;
  }

  get parentValue(): string | null {
    const length = PARENT_LENGTH[this.value.length];
    return length === undefined ? null : this.value.slice(0, length);
  }
}
