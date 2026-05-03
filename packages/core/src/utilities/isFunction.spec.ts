import { describe, expect, it } from 'vitest'

import { isFunction } from '../utilities/isFunction.js'

describe('isFunction', () => {
  it('returns true for regular functions', () => {
    const arrowFn = () => {}
    function regularFn() {}
    expect(isFunction(arrowFn)).toBe(true)
    expect(isFunction(regularFn)).toBe(true)
  })

  it('returns true for built-in functions', () => {
    expect(isFunction(Math.max)).toBe(true)
    expect(isFunction(Array.prototype.push)).toBe(true)
  })

  it('returns true for constructor functions', () => {
    expect(isFunction(Date)).toBe(true)
    expect(isFunction(Array)).toBe(true)
    expect(isFunction(Object)).toBe(true)
  })

  it('returns true for async functions', () => {
    const asyncFn = async () => {}
    expect(isFunction(asyncFn)).toBe(true)
  })

  it('returns false for non-function values', () => {
    expect(isFunction(null)).toBe(false)
    expect(isFunction(undefined)).toBe(false)
    expect(isFunction(42)).toBe(false)
    expect(isFunction('string')).toBe(false)
    expect(isFunction(true)).toBe(false)
    expect(isFunction(false)).toBe(false)
    expect(isFunction({})).toBe(false)
    expect(isFunction([])).toBe(false)
    expect(isFunction(new Date())).toBe(false)
    expect(isFunction(/regex/)).toBe(false)
  })

  it('returns false for function-like objects', () => {
    const obj = {
      call: () => {},
      apply: () => {},
    }
    expect(isFunction(obj)).toBe(false)
  })
})
