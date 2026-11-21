import { apiUrl } from '../../api'
import type { AccountNode, FieldError, NewAccount } from './types'

export class ApiError extends Error {
  status: number
  fieldErrors: FieldError[]

  constructor(message: string, status: number, fieldErrors: FieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch (e) {
    if (isAbort(e)) throw e
    throw new ApiError('No se pudo conectar con el servidor. Revisa que la API esté corriendo.', 0)
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string
      errors?: FieldError[]
    } | null
    throw new ApiError(
      body?.message ?? `Error inesperado del servidor (HTTP ${response.status}).`,
      response.status,
      body?.errors ?? [],
    )
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

export const fetchAccountTree = (signal?: AbortSignal) =>
  request<AccountNode[]>('/accounts', { signal })

export const createAccount = (input: NewAccount) =>
  request<{ code: string }>('/accounts', { method: 'POST', body: JSON.stringify(input) })

export const deleteAccount = (code: string) =>
  request<void>(`/accounts/${encodeURIComponent(code)}`, { method: 'DELETE' })

export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : 'Ocurrió un error inesperado.'
