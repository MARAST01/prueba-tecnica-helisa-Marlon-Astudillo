import type { AccountNode, Level, Nature } from './types'

const LEVEL_BY_LENGTH: Record<number, Level> = { 1: 'clase', 2: 'grupo', 4: 'cuenta', 6: 'subcuenta' }
const PARENT_LENGTH: Record<number, number> = { 2: 1, 4: 2, 6: 4 }

export const LEVEL_LABEL: Record<Level, string> = {
  clase: 'Clase',
  grupo: 'Grupo',
  cuenta: 'Cuenta',
  subcuenta: 'Subcuenta',
}
export const NATURE_LABEL: Record<Nature, string> = { debito: 'Débito', credito: 'Crédito' }

export const levelOf = (code: string): Level | undefined => LEVEL_BY_LENGTH[code.length]

export function parentOf(code: string): string | null {
  const length = PARENT_LENGTH[code.length]
  return length === undefined ? null : code.slice(0, length)
}

export function indexAccounts(nodes: AccountNode[], into = new Map<string, AccountNode>()) {
  for (const node of nodes) {
    into.set(node.code, node)
    indexAccounts(node.children, into)
  }
  return into
}

export function expandableCodes(nodes: AccountNode[], into: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children.length > 0) into.push(node.code)
    expandableCodes(node.children, into)
  }
  return into
}

/** Minúsculas y sin tildes, para que "credito" encuentre "Crédito". */
export const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export const matchesQuery = (node: AccountNode, query: string) =>
  normalize(`${node.code} ${node.name}`).includes(normalize(query))

/**
 * Deja solo las ramas con coincidencias. `open` son los ancestros que hay que
 * abrir para verlas. Si coincide un nodo sin hijas coincidentes, conserva sus
 * hijas originales (cerrado), para que no parezca una hoja.
 */
export function filterTree(nodes: AccountNode[], query: string) {
  const open = new Set<string>()
  let matches = 0

  const walk = (list: AccountNode[]): AccountNode[] =>
    list.flatMap((node) => {
      const self = matchesQuery(node, query)
      const children = walk(node.children)
      if (self) matches++
      if (!self && children.length === 0) return []
      if (children.length > 0) open.add(node.code)
      return [{ ...node, children: children.length > 0 ? children : node.children }]
    })

  return { nodes: walk(nodes), matches, open }
}