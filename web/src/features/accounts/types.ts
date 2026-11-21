export type Nature = 'debito' | 'credito'
export type Level = 'clase' | 'grupo' | 'cuenta' | 'subcuenta'

export interface AccountNode {
  code: string
  name: string
  level: Level
  nature: Nature
  acceptsMovements: boolean
  children: AccountNode[]
}

export interface FieldError {
  field?: string
  message: string
}

export interface NewAccount {
  code: string
  name: string
  nature?: Nature
}
