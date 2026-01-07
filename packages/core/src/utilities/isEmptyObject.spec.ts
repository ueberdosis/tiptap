import { describe, expect, it } from 'vitest'

import { isEmptyObject } from '../utilities/isEmptyObject.js'

describe('isEmptyObject', () => {
  it('returns true for empty object', () => {
    expect(isEmptyObject({})).toBe(true)
  })

  it('returns true for default empty object parameter', () => {
    expect(isEmptyObject()).toBe(true)
  })

  it('returns false for object with properties', () => {
    expect(isEmptyObject({ key: 'value' })).toBe(false)
    expect(isEmptyObject({ a: 1, b: 2 })).toBe(false)
  })

  it('returns false for non-plain objects', () => {
    expect(isEmptyObject([])).toBe(false)
    expect(isEmptyObject(new Date())).toBe(false)
  })

  it('returns false for objects with inherited properties', () => {
    class TestClass {}
    const instance = new TestClass()
    expect(isEmptyObject(instance)).toBe(false)
  })

  it('returns false for arrays', () => {
    expect(isEmptyObject([])).toBe(false)
  })

  it('returns false for primitive values', () => {
    expect(isEmptyObject('')).toBe(false)
    expect(isEmptyObject(0)).toBe(false)
    expect(isEmptyObject(false)).toBe(false)
  })
})
