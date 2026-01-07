import { describe, expect, it } from 'vitest'

import { fromString } from '../utilities/fromString.js'

describe('fromString', () => {
  it('returns non-string values unchanged', () => {
    expect(fromString(42)).toBe(42)
    expect(fromString(true)).toBe(true)
    expect(fromString(false)).toBe(false)
    expect(fromString(null)).toBe(null)
    expect(fromString(undefined)).toBe(undefined)
    expect(fromString({ key: 'value' })).toEqual({ key: 'value' })
    expect(fromString([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('converts string numbers to numbers', () => {
    expect(fromString('42')).toBe(42)
    expect(fromString('3.14')).toBe(3.14)
    expect(fromString('0')).toBe(0)
    expect(fromString('-5')).toBe(-5)
    expect(fromString('+10')).toBe(10)
    expect(fromString('123.456')).toBe(123.456)
  })

  it('converts "true" to boolean true', () => {
    expect(fromString('true')).toBe(true)
  })

  it('converts "false" to boolean false', () => {
    expect(fromString('false')).toBe(false)
  })

  it('returns other strings unchanged', () => {
    expect(fromString('hello')).toBe('hello')
    expect(fromString('world')).toBe('world')
    expect(fromString('')).toBe('')
    expect(fromString('123abc')).toBe('123abc')
    expect(fromString('true-ish')).toBe('true-ish')
    expect(fromString('false-positive')).toBe('false-positive')
  })

  it('handles edge cases with numbers', () => {
    expect(fromString('0.0')).toBe(0.0)
    expect(fromString('-0')).toBe(-0)
    expect(fromString('+0')).toBe(0)
    expect(fromString('.5')).toBe(0.5) // Matches regex (optional digits before dot)
    expect(fromString('5.')).toBe('5.') // Doesn't match regex (no digit after dot)
  })

  it('does not convert invalid number strings', () => {
    expect(fromString('123abc')).toBe('123abc')
    expect(fromString('12.34.56')).toBe('12.34.56')
    expect(fromString('+-5')).toBe('+-5')
    expect(fromString('5-')).toBe('5-')
    expect(fromString('')).toBe('')
    expect(fromString(' ')).toBe(' ')
    expect(fromString(' 123 ')).toBe(' 123 ')
  })

  it('handles scientific notation and special number formats', () => {
    expect(fromString('1e10')).toBe('1e10') // Not matched by regex
    expect(fromString('0x10')).toBe('0x10') // Not matched by regex
    expect(fromString('Infinity')).toBe('Infinity') // Not matched by regex
    expect(fromString('NaN')).toBe('NaN') // Not matched by regex
  })

  it('preserves case sensitivity for boolean strings', () => {
    expect(fromString('True')).toBe('True')
    expect(fromString('False')).toBe('False')
    expect(fromString('TRUE')).toBe('TRUE')
    expect(fromString('FALSE')).toBe('FALSE')
  })

  it('handles decimal numbers correctly', () => {
    expect(fromString('0.1')).toBe(0.1)
    expect(fromString('0.01')).toBe(0.01)
    expect(fromString('10.0')).toBe(10.0)
    expect(fromString('100.001')).toBe(100.001)
  })
})
