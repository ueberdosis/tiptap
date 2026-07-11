import type { Ref, RefCallback, RefObject } from 'react'
import { useCallback } from 'react'

/** Writes a value to a callback or object ref. */
export const assignRef = <T>(ref: Ref<T> | undefined, value: T | null): void => {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

const refSetters = new WeakMap<RefObject<unknown>, RefCallback<never>>()

/**
 * A callback ref writing into `ref`, cached per ref object so its identity
 * is stable across renders (React re-attaches changed callback refs).
 * Components get callback refs because they attach to any element type;
 * object refs would not (their `current` makes them invariant).
 */
export const refSetter = <T>(ref: RefObject<T | null>): RefCallback<T> => {
  let setter = refSetters.get(ref)

  if (!setter) {
    setter = (value: T | null) => {
      ref.current = value
    }
    refSetters.set(ref, setter)
  }
  return setter as RefCallback<T>
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
