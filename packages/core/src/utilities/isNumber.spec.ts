import { describe, expect, it } from 'vitest'

import { isNumber } from '../utilities/isNumber.js'

describe('isNumber', () => {
  it('returns true for numbers', () => {
    expect(isNumber(42)).toBe(true)
    expect(isNumber(3.14)).toBe(true)
    expect(isNumber(0)).toBe(true)
    expect(isNumber(-5)).toBe(true)
    expect(isNumber(Infinity)).toBe(true)
    expect(isNumber(-Infinity)).toBe(true)
    expect(isNumber(NaN)).toBe(true)
  })

  it('returns false for non-number values', () => {
    expect(isNumber('42')).toBe(false)
    expect(isNumber(null)).toBe(false)
    expect(isNumber(undefined)).toBe(false)
    expect(isNumber(true)).toBe(false)
    expect(isNumber(false)).toBe(false)
    expect(isNumber({})).toBe(false)
    expect(isNumber([])).toBe(false)
    expect(isNumber(() => {})).toBe(false)
    expect(isNumber(new Date())).toBe(false)
    expect(isNumber(/regex/)).toBe(false)
  })

  it('returns false for numeric strings', () => {
    expect(isNumber('42')).toBe(false)
    expect(isNumber('3.14')).toBe(false)
    expect(isNumber('0')).toBe(false)
  })
})
