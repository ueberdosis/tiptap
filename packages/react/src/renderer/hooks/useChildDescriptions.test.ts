import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ReactWidgetViewDesc } from '../viewdesc/index.js'
import { useChildDescriptions } from './useChildDescriptions.js'

/** Cheap throwaway desc — we only care about object identity. */
function makeDesc(): ReactWidgetViewDesc {
  return new ReactWidgetViewDesc(undefined, {} as never, document.createElement('span'))
}

describe('useChildDescriptions', () => {
  it('appends children in registration order', () => {
    const { result } = renderHook(() => useChildDescriptions())
    const a = makeDesc()
    const b = makeDesc()
    const c = makeDesc()

    result.current.value.addChild(a, 0)
    result.current.value.addChild(b, 1)
    result.current.value.addChild(c, 2)

    expect(result.current.childrenRef.current).toEqual([a, b, c])
  })

  it('inserts at the requested index', () => {
    const { result } = renderHook(() => useChildDescriptions())
    const a = makeDesc()
    const b = makeDesc()
    const c = makeDesc()

    result.current.value.addChild(a, 0)
    result.current.value.addChild(c, 1)
    result.current.value.addChild(b, 1) // insert between a and c

    expect(result.current.childrenRef.current).toEqual([a, b, c])
  })

  it('is idempotent for the same desc at the same index', () => {
    const { result } = renderHook(() => useChildDescriptions())
    const a = makeDesc()

    result.current.value.addChild(a, 0)
    result.current.value.addChild(a, 0)

    expect(result.current.childrenRef.current).toEqual([a])
  })

  it('moves a desc when re-registered at a different index', () => {
    const { result } = renderHook(() => useChildDescriptions())
    const a = makeDesc()
    const b = makeDesc()
    const c = makeDesc()

    result.current.value.addChild(a, 0)
    result.current.value.addChild(b, 1)
    result.current.value.addChild(c, 2)
    result.current.value.addChild(a, 2) // a moves to the end

    expect(result.current.childrenRef.current).toEqual([b, c, a])
  })

  it('clamps out-of-range indices instead of throwing', () => {
    const { result } = renderHook(() => useChildDescriptions())
    const a = makeDesc()
    const b = makeDesc()

    result.current.value.addChild(a, 99)
    result.current.value.addChild(b, -3)

    expect(result.current.childrenRef.current).toEqual([b, a])
  })

  it('removeChild is a no-op for an absent desc', () => {
    const { result } = renderHook(() => useChildDescriptions())
    const stray = makeDesc()

    expect(() => result.current.value.removeChild(stray)).not.toThrow()
    expect(result.current.childrenRef.current).toEqual([])
  })

  it('removeChild removes an inserted desc', () => {
    const { result } = renderHook(() => useChildDescriptions())
    const a = makeDesc()
    const b = makeDesc()

    result.current.value.addChild(a, 0)
    result.current.value.addChild(b, 1)
    result.current.value.removeChild(a)

    expect(result.current.childrenRef.current).toEqual([b])
  })

  it('returns stable addChild / removeChild identities across renders', () => {
    const { result, rerender } = renderHook(() => useChildDescriptions())
    const initial = result.current.value
    rerender()

    expect(result.current.value).toBe(initial)
    expect(result.current.value.addChild).toBe(initial.addChild)
    expect(result.current.value.removeChild).toBe(initial.removeChild)
  })

  it('childrenRef.current keeps the same array identity across renders', () => {
    const { result, rerender } = renderHook(() => useChildDescriptions())
    const arrayBefore = result.current.childrenRef.current
    rerender()

    expect(result.current.childrenRef.current).toBe(arrayBefore)
  })
})
