import { describe, expect, it } from 'vitest'

import { isString } from '../utilities/isString.js'

describe('isString', () => {
  it('returns true for strings', () => {
    expect(isString('')).toBe(true)
    expect(isString('hello')).toBe(true)
    expect(isString('123')).toBe(true)
    expect(isString('hello world')).toBe(true)
  })

  it('returns false for non-string values', () => {
    expect(isString(null)).toBe(false)
    expect(isString(undefined)).toBe(false)
    expect(isString(42)).toBe(false)
    expect(isString(3.14)).toBe(false)
    expect(isString(true)).toBe(false)
    expect(isString(false)).toBe(false)
    expect(isString({})).toBe(false)
    expect(isString([])).toBe(false)
    expect(isString(() => {})).toBe(false)
    expect(isString(new Date())).toBe(false)
    expect(isString(/regex/)).toBe(false)
  })

  it('returns false for numbers', () => {
    expect(isString(0)).toBe(false)
    expect(isString(-5)).toBe(false)
    expect(isString(Infinity)).toBe(false)
    expect(isString(NaN)).toBe(false)
  })
})
