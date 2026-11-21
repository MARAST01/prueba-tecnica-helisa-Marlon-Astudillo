import { useEffect, useMemo, useRef, useState } from 'react'
import { LEVEL_LABEL, NATURE_LABEL, expandableCodes, filterTree, matchesQuery, parentOf } from '../domain'
import type { AccountNode } from '../types'

interface Props {
  nodes: AccountNode[]
  reveal?: { code: string }
  onDelete: (node: AccountNode) => void
}

export function AccountTree({ nodes, reveal, onDelete }: Props) {
  const [expanded, setExpanded] = useState(() => new Set(nodes.filter((n) => n.children.length).map((n) => n.code)))
  const [query, setQuery] = useState('')
  const savedExpanded = useRef<Set<string> | null>(null) // estado previo a la búsqueda

  const searching = query.trim() !== ''
  const view = useMemo(() => (searching ? filterTree(nodes, query) : null), [nodes, query, searching])
  const shown = view?.nodes ?? nodes

  function search(value: string) {
    setQuery(value)
    if (value.trim()) {
      savedExpanded.current ??= expanded
      setExpanded(filterTree(nodes, value).open)
    } else if (savedExpanded.current) {
      setExpanded(savedExpanded.current)
      savedExpanded.current = null
    }
  }

  // Al crear una cuenta se limpia la búsqueda y se abren sus ancestros para que se vea.
  useEffect(() => {
    if (!reveal) return
    setQuery('')
    const base = savedExpanded.current
    savedExpanded.current = null
    setExpanded((prev) => {
      const next = new Set(base ?? prev)
      for (let p = parentOf(reveal.code); p; p = parentOf(p)) next.add(p)
      return next
    })
  }, [reveal])

  const toggle = (code: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (!next.delete(code)) next.add(code)
      return next
    })

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar cuenta por código o nombre"
          value={query}
          onChange={(e) => search(e.target.value)}
        />
        <button type="button" onClick={() => setExpanded(new Set(expandableCodes(shown)))}>
          Expandir todo
        </button>
        <button type="button" onClick={() => setExpanded(new Set())}>
          Colapsar todo
        </button>
      </div>

      <p className="hint" role="status" aria-live="polite">
        {view && view.matches > 0 && `${view.matches} ${view.matches === 1 ? 'coincidencia' : 'coincidencias'}`}
      </p>

      {view && view.matches === 0 ? (
        <p className="state">
          Sin coincidencias para «{query.trim()}».{' '}
          <button type="button" className="link" onClick={() => search('')}>Limpiar búsqueda</button>
        </p>
      ) : (
        <ul role="tree" aria-label="Catálogo de cuentas" className="tree">
          {shown.map((node) => (
            <Row key={node.code} node={node} expanded={expanded} flash={reveal?.code}
              query={searching ? query : ''} onToggle={toggle} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </>
  )
}

interface RowProps {
  node: AccountNode
  expanded: Set<string>
  flash?: string
  query: string
  onToggle: (code: string) => void
  onDelete: (node: AccountNode) => void
}

function Row({ node, expanded, flash, query, onToggle, onDelete }: RowProps) {
  const hasChildren = node.children.length > 0
  const open = hasChildren && expanded.has(node.code)
  const isMatch = query !== '' && matchesQuery(node, query)

  return (
    <li role="treeitem" aria-expanded={hasChildren ? open : undefined} aria-selected={false}>
      <div className={`row${flash === node.code ? ' flash' : ''}${isMatch ? ' match' : ''}`}>
        {hasChildren ? (
          <button
            type="button"
            className="toggle"
            aria-label={`${open ? 'Colapsar' : 'Expandir'} ${node.code} ${node.name}`}
            onClick={() => onToggle(node.code)}
          >
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="toggle" aria-hidden="true" />
        )}
        <span className="code">{node.code}</span>
        <span className="name">{node.name}</span>
        <span className="badges">
          <span className={`badge level-${node.level}`}>{LEVEL_LABEL[node.level]}</span>
          {node.level === 'clase' && <span className="badge">{NATURE_LABEL[node.nature]}</span>}
          {node.acceptsMovements && <span className="badge ok">Admite movimientos</span>}
        </span>
        <button
          type="button"
          className="icon-danger"
          aria-label={`Eliminar ${node.code} ${node.name}`}
          onClick={() => onDelete(node)}
        >
          Eliminar
        </button>
      </div>
      {open && (
        <ul role="group" className="tree">
          {node.children.map((child) => (
            <Row key={child.code} node={child} expanded={expanded} flash={flash} query={query}
              onToggle={onToggle} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </li>
  )
}