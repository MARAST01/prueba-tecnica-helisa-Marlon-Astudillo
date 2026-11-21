import { useCallback, useEffect, useState } from 'react'
import { errorMessage, fetchAccountTree, isAbort } from './accountsApi'
import type { AccountNode } from './types'

export function useAccountTree() {
  const [tree, setTree] = useState<AccountNode[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      setTree(await fetchAccountTree(signal))
    } catch (e) {
      if (!isAbort(e)) setError(errorMessage(e))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  return { tree, loading, error, reload: () => load() }
}
