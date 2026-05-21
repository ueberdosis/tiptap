/** Parent-side hook owning the ordered list of child descriptors. */

import { useCallback, useMemo, useRef } from 'react'

import type { ChildDescriptionsContextValue } from '../contexts/ChildDescriptionsContext.js'
import type { ReactViewDesc } from '../viewdesc/index.js'

export interface UseChildDescriptionsResult {
  /** Live array. Mutated in place — capture once, keep seeing updates. */
  childrenRef: { readonly current: ReactViewDesc[] }
  /** Forward to `<ChildDescriptionsContext.Provider value={...}>`. */
  value: ChildDescriptionsContextValue
}

export function useChildDescriptions(): UseChildDescriptionsResult {
  const childrenRef = useRef<ReactViewDesc[]>([])

  const addChild = useCallback((desc: ReactViewDesc, index: number) => {
    const list = childrenRef.current
    // Move semantics: if desc already exists, splice it out first so
    // double-invocation (Strict mode) doesn't create duplicates.
    const existing = list.indexOf(desc)
    if (existing !== -1) {
      if (existing === index) {
        return
      }
      list.splice(existing, 1)
    }
    const target = Math.max(0, Math.min(index, list.length))
    list.splice(target, 0, desc)
  }, [])

  const removeChild = useCallback((desc: ReactViewDesc) => {
    const list = childrenRef.current
    const at = list.indexOf(desc)
    if (at !== -1) {
      list.splice(at, 1)
    }
  }, [])

  const value = useMemo<ChildDescriptionsContextValue>(() => ({ addChild, removeChild }), [addChild, removeChild])

  return { childrenRef, value }
}
