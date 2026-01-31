import { describe, expect, it } from 'vitest'

import { isRegExp } from '../utilities/isRegExp.js'

describe('isRegExp', () => {
  it('returns true for RegExp objects', () => {
    expect(isRegExp(/test/)).toBe(true)
    expect(isRegExp(/test/gi)).toBe(true)
  })

  it('returns false for non-RegExp values', () => {
    expect(isRegExp(null)).toBe(false)
    expect(isRegExp(undefined)).toBe(false)
    expect(isRegExp(42)).toBe(false)
    expect(isRegExp('string')).toBe(false)
    expect(isRegExp(true)).toBe(false)
    expect(isRegExp(false)).toBe(false)
    expect(isRegExp({})).toBe(false)
    expect(isRegExp([])).toBe(false)
    expect(isRegExp(() => {})).toBe(false)
    expect(isRegExp(new Date())).toBe(false)
  })

  it('returns false for regex-like strings', () => {
    expect(isRegExp('/test/')).toBe(false)
    expect(isRegExp('/test/gi')).toBe(false)
  })

  it('returns false for objects with regex properties', () => {
    const obj = {
      source: 'test',
      flags: 'gi',
      test: () => true,
    }
    expect(isRegExp(obj)).toBe(false)
  })
})
