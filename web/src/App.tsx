import { useMemo, useState } from 'react'
import { deleteAccount, errorMessage } from './features/accounts/accountsApi'
import { indexAccounts } from './features/accounts/domain'
import { AccountForm } from './features/accounts/components/AccountForm'
import { AccountTree } from './features/accounts/components/AccountTree'
import { ConfirmDialog } from './features/accounts/components/ConfirmDialog'
import { useAccountTree } from './features/accounts/useAccountTree'
import type { AccountNode } from './features/accounts/types'

function App() {
  const { tree, loading, error, reload } = useAccountTree()
  const accounts = useMemo(() => indexAccounts(tree ?? []), [tree])
  const [reveal, setReveal] = useState<{ code: string }>()
  const [notice, setNotice] = useState<string | null>(null)
  const [target, setTarget] = useState<AccountNode | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleCreated(code: string) {
    setNotice(`Cuenta ${code} creada.`)
    setReveal({ code })
    await reload()
  }

  function askDelete(node: AccountNode) {
    setDeleteError(null)
    setTarget(node)
  }

  async function confirmDelete() {
    if (!target) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccount(target.code)
      setNotice(`Cuenta ${target.code} eliminada.`)
      setTarget(null)
      await reload()
    } catch (e) {
      setDeleteError(errorMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main>
      <header>
        <h1>Catálogo de cuentas</h1>
        <p className="hint">Clases, grupos, cuentas y subcuentas de la empresa.</p>
      </header>

      {notice && (
        <p role="status" className="alert alert-ok">
          {notice}
          <button type="button" className="link" onClick={() => setNotice(null)}>Cerrar</button>
        </p>
      )}

      <div className="layout">
        <section className="card" aria-labelledby="tree-title" aria-busy={loading}>
          <h2 id="tree-title">
            Árbol de cuentas {loading && tree && <small className="hint">Actualizando…</small>}
          </h2>
          {loading && !tree && <p className="state">Cargando catálogo…</p>}
          {error && (
            <div role="alert" className="alert alert-error">
              <p>No se pudo cargar el catálogo. {error}</p>
              <button type="button" onClick={reload}>Reintentar</button>
            </div>
          )}
          {tree && tree.length === 0 && <p className="state">Aún no hay cuentas. Crea una clase para empezar.</p>}
          {tree && tree.length > 0 && <AccountTree nodes={tree} reveal={reveal} onDelete={askDelete} />}
        </section>

        <section className="card" aria-labelledby="form-title">
          <h2 id="form-title">Nueva cuenta</h2>
          <AccountForm accounts={accounts} onCreated={handleCreated} />
        </section>
      </div>

      {target && (
        <ConfirmDialog
          title="Eliminar cuenta"
          message={`¿Eliminar la cuenta ${target.code} · ${target.name}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setTarget(null)}
        />
      )}
    </main>
  )
}

export default App
