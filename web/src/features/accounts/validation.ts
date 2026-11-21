import { levelOf, parentOf } from './domain'
import type { AccountNode, Nature } from './types'

export interface FormValues {
  code: string
  name: string
  nature: '' | Nature
}
export type FormField = keyof FormValues
export type FieldErrors = Partial<Record<FormField, string>>

/** Replica en el cliente las reglas de la API para avisar antes de enviar. */
export function validateAccount(
  values: FormValues,
  accounts: ReadonlyMap<string, AccountNode>,
): FieldErrors {
  const errors: FieldErrors = {}
  const code = values.code.trim()
  const numeric = /^\d+$/.test(code)

  if (!code) errors.code = 'El código es obligatorio.'
  else if (!numeric) errors.code = 'El código solo puede contener dígitos.'
  else if (!levelOf(code)) errors.code = 'El código debe tener 1, 2, 4 o 6 dígitos.'
  else if (accounts.has(code)) errors.code = `Ya existe una cuenta con el código ${code}.`
  else {
    const parent = parentOf(code)
    if (parent && !accounts.has(parent)) errors.code = `No existe la cuenta padre ${parent}. Créala primero.`
  }

  const name = values.name.trim()
  if (!name) errors.name = 'El nombre es obligatorio.'
  else if (name.length > 100) errors.name = 'El nombre no puede superar 100 caracteres.'

  if (numeric && levelOf(code) === 'clase' && !values.nature)
    errors.nature = 'La clase requiere una naturaleza: débito o crédito.'

  return errors
}
