import { describe, expect, it } from 'vitest'

import { objectIncludes } from './objectIncludes.js'

describe('objectIncludes', () => {
  it('returns true when object2 is empty', () => {
    const object1 = { a: 1, b: 2 }
    const object2 = {}

    expect(objectIncludes(object1, object2)).toBe(true)
  })

  it('returns true when all properties match exactly in strict mode', () => {
    const object1 = { a: 1, b: 'hello', c: true }
    const object2 = { a: 1, b: 'hello' }

    expect(objectIncludes(object1, object2)).toBe(true)
  })

  it('returns false when properties do not match in strict mode', () => {
    const object1 = { a: 1, b: 'hello' }
    const object2 = { a: 2, b: 'hello' }

    expect(objectIncludes(object1, object2)).toBe(false)
  })

  it('returns false when object1 is missing properties from object2', () => {
    const object1 = { a: 1 }
    const object2 = { a: 1, b: 'hello' }

    expect(objectIncludes(object1, object2)).toBe(false)
  })

  it('returns true when object1 has extra properties', () => {
    const object1 = { a: 1, b: 'hello', c: 'extra' }
    const object2 = { a: 1, b: 'hello' }

    expect(objectIncludes(object1, object2)).toBe(true)
  })

  it('handles null and undefined values', () => {
    const object1 = { a: null, b: undefined, c: 0 }
    const object2 = { a: null, b: undefined }

    expect(objectIncludes(object1, object2)).toBe(true)
  })

  it('returns false when null/undefined values do not match', () => {
    const object1 = { a: null, b: undefined }
    const object2 = { a: undefined, b: null }

    expect(objectIncludes(object1, object2)).toBe(false)
  })

  it('supports RegExp matching in non-strict mode', () => {
    const object1 = { text: 'hello world', number: 42 }
    const object2 = { text: /hello/, number: 42 }

    expect(objectIncludes(object1, object2, { strict: false })).toBe(true)
  })

  it('returns false when RegExp does not match in non-strict mode', () => {
    const object1 = { text: 'goodbye world' }
    const object2 = { text: /hello/ }

    expect(objectIncludes(object1, object2, { strict: false })).toBe(false)
  })

  it('falls back to strict equality for non-RegExp values in non-strict mode', () => {
    const object1 = { a: 1, b: 'hello' }
    const object2 = { a: 1, b: 'world' }

    expect(objectIncludes(object1, object2, { strict: false })).toBe(false)
  })

  it('handles mixed types correctly', () => {
    const object1 = { str: 'text', num: 42, bool: true, arr: [1, 2, 3] }
    const object2 = { str: 'text', num: 42, bool: true }

    expect(objectIncludes(object1, object2)).toBe(true)
  })

  it('returns false when array references do not match', () => {
    const object1 = { arr: [1, 2, 3] }
    const object2 = { arr: [1, 2, 3] }

    // Arrays are compared by reference in strict equality
    expect(objectIncludes(object1, object2)).toBe(false)
  })

  it('handles RegExp objects as values in strict mode', () => {
    const regex = /test/
    const object1 = { pattern: regex }
    const object2 = { pattern: regex }

    expect(objectIncludes(object1, object2)).toBe(true)
  })

  it('returns false when RegExp objects do not match by reference', () => {
    const object1 = { pattern: /test/ }
    const object2 = { pattern: /test/ }

    expect(objectIncludes(object1, object2)).toBe(false)
  })

  it('defaults to strict mode when options not provided', () => {
    const object1 = { a: 1, b: /test/ }
    const object2 = { a: 1, b: /test/ }

    expect(objectIncludes(object1, object2)).toBe(false)
  })
})
