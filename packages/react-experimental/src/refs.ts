import type { Ref, RefCallback } from 'react'
import { useCallback } from 'react'

/** Writes a value to a callback or object ref. */
export const assignRef = <T>(ref: Ref<T> | undefined, value: T | null): void => {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

/** Merges multiple refs into one callback ref. */
export const mergeRefs =
  <T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> =>
  value => {
    refs.forEach(ref => assignRef(ref, value))
  }

/**
 * Merges refs with a stable identity, for node views whose top-level element
 * also holds their content (`ref` + `contentDOMRef` on the same element).
 */
export const useMergedRefs = <T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> =>
  // The ref list is the dependency list: same refs, same callback
  useCallback(mergeRefs(...refs), refs)
