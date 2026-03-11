import { describe, expect, it } from 'vitest'

import { isPlainObject } from '../utilities/isPlainObject.js'

describe('isPlainObject', () => {
  it('returns true for plain objects', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ key: 'value' })).toBe(true)
    expect(isPlainObject({ a: 1, b: 2 })).toBe(true)
  })

  it('returns false for non-plain objects', () => {
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject(/regex/)).toBe(false)
  })

  it('returns false for arrays', () => {
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject([1, 2, 3])).toBe(false)
  })

  it('returns false for functions', () => {
    const fn = () => {}
    expect(isPlainObject(fn)).toBe(false)
  })

  it('returns false for primitive values', () => {
    expect(isPlainObject(42)).toBe(false)
    expect(isPlainObject('string')).toBe(false)
    expect(isPlainObject(true)).toBe(false)
    expect(isPlainObject(false)).toBe(false)
  })

  it('returns false for class instances', () => {
    class TestClass {
      prop = 'value'
    }
    const instance = new TestClass()
    expect(isPlainObject(instance)).toBe(false)
  })

  it('returns false for objects with modified prototypes', () => {
    const obj = {}
    Object.setPrototypeOf(obj, { custom: true })
    expect(isPlainObject(obj)).toBe(false)
  })

  it('returns false for built-in objects', () => {
    expect(isPlainObject(new Map())).toBe(false)
    expect(isPlainObject(new Set())).toBe(false)
    expect(isPlainObject(new WeakMap())).toBe(false)
  })
})
