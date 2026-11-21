import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError, createAccount, errorMessage } from '../accountsApi'
import { LEVEL_LABEL, NATURE_LABEL, levelOf, parentOf } from '../domain'
import type { AccountNode } from '../types'
import { validateAccount, type FieldErrors, type FormField, type FormValues } from '../validation'

interface Props {
  accounts: ReadonlyMap<string, AccountNode>
  onCreated: (code: string) => Promise<void> | void
}

const EMPTY: FormValues = { code: '', name: '', nature: '' }
const FIELDS: FormField[] = ['code', 'name', 'nature']

export function AccountForm({ accounts, onCreated }: Props) {
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({})
  const [serverErrors, setServerErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const clientErrors = useMemo(() => validateAccount(values, accounts), [values, accounts])
  const errorFor = (f: FormField) => serverErrors[f] ?? (submitted || touched[f] ? clientErrors[f] : undefined)

  const code = values.code.trim()
  const level = /^\d+$/.test(code) ? levelOf(code) : undefined
  const parentCode = level ? parentOf(code) : null
  const parent = parentCode ? accounts.get(parentCode) : undefined
  const isClass = level === 'clase'

  function change(field: FormField, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    setServerErrors((e) => ({ ...e, [field]: undefined }))
    setFormError(null)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) return

    setSubmitting(true)
    try {
      await createAccount({ code, name: values.name.trim(), ...(isClass && values.nature ? { nature: values.nature } : {}) })
      setValues(EMPTY)
      setSubmitted(false)
      setTouched({})
      setServerErrors({})
      await onCreated(code)
    } catch (err) {
      const mapped: FieldErrors = {}
      const general: string[] = []
      if (err instanceof ApiError) {
        for (const fe of err.fieldErrors) {
          if (fe.field && (FIELDS as string[]).includes(fe.field)) mapped[fe.field as FormField] = fe.message
          else general.push(fe.message)
        }
      }
      setServerErrors(mapped)
      if (Object.keys(mapped).length === 0) setFormError(general[0] ?? errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate aria-busy={submitting}>
      <Field id="code" label="Código" error={errorFor('code')}
        hint={level ? `${LEVEL_LABEL[level]}${parentCode ? ` · padre: ${parentCode}${parent ? ` ${parent.name}` : ''}` : ''}` : 'Ej.: 1, 11, 1105 o 110505'}>
        <input id="code" inputMode="numeric" autoComplete="off" value={values.code} disabled={submitting}
          aria-invalid={!!errorFor('code')} aria-describedby="code-msg"
          onChange={(e) => change('code', e.target.value)} onBlur={() => setTouched((t) => ({ ...t, code: true }))} />
      </Field>

      <Field id="name" label="Nombre" error={errorFor('name')}>
        <input id="name" autoComplete="off" value={values.name} disabled={submitting}
          aria-invalid={!!errorFor('name')} aria-describedby="name-msg"
          onChange={(e) => change('name', e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))} />
      </Field>

      {isClass ? (
        <Field id="nature" label="Naturaleza" error={errorFor('nature')}>
          <select id="nature" value={values.nature} disabled={submitting}
            aria-invalid={!!errorFor('nature')} aria-describedby="nature-msg"
            onChange={(e) => change('nature', e.target.value)} onBlur={() => setTouched((t) => ({ ...t, nature: true }))}>
            <option value="">Selecciona…</option>
            <option value="debito">Débito</option>
            <option value="credito">Crédito</option>
          </select>
        </Field>
      ) : (
        parent && <p className="hint">Hereda la naturaleza <strong>{NATURE_LABEL[parent.nature]}</strong> de su clase.</p>
      )}

      {formError && <p role="alert" className="alert alert-error">{formError}</p>}

      <button type="submit" className="primary" disabled={submitting}>
        {submitting ? 'Creando…' : 'Crear cuenta'}
      </button>
    </form>
  )
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      <p id={`${id}-msg`} className={error ? 'error' : 'hint'} role={error ? 'alert' : undefined}>
        {error ?? hint ?? '\u00a0'}
      </p>
    </div>
  )
}
