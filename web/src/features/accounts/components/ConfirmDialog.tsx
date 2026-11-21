import { useEffect, useRef } from 'react'

interface Props {
  title: string
  message: string
  confirmLabel: string
  busy: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, message, confirmLabel, busy, error, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onCancel()
      }}
    >
      <h2 id="dialog-title">{title}</h2>
      <p>{message}</p>
      {error && (
        <p role="alert" className="alert alert-error">
          {error}
        </p>
      )}
      <div className="actions">
        <button type="button" onClick={onCancel} disabled={busy}>
          {error ? 'Cerrar' : 'Cancelar'}
        </button>
        <button type="button" className="danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Eliminando…' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
