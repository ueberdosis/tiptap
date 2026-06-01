import { marksEqual } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

describe('marksEqual', () => {
  it('returns true for identical marks with same attrs key order', () => {
    const a = [{ type: 'bold', attrs: { level: 1, color: 'red' } }]
    const b = [{ type: 'bold', attrs: { level: 1, color: 'red' } }]
    expect(marksEqual(a, b)).toBe(true)
  })

  it('returns true for identical marks with different attrs key order', () => {
    const a = [{ type: 'bold', attrs: { level: 1, color: 'red' } }]
    const b = [{ type: 'bold', attrs: { color: 'red', level: 1 } }]
    expect(marksEqual(a, b)).toBe(true)
  })

  it('returns true for identical marks without attrs', () => {
    const a = [{ type: 'italic' }, { type: 'bold' }]
    const b = [{ type: 'italic' }, { type: 'bold' }]
    expect(marksEqual(a, b)).toBe(true)
  })

  it('returns false for marks with different types', () => {
    const a = [{ type: 'bold', attrs: { level: 1 } }]
    const b = [{ type: 'italic', attrs: { level: 1 } }]
    expect(marksEqual(a, b)).toBe(false)
  })

  it('returns false for marks with different attrs', () => {
    const a = [{ type: 'bold', attrs: { level: 1 } }]
    const b = [{ type: 'bold', attrs: { level: 2 } }]
    expect(marksEqual(a, b)).toBe(false)
  })

  it('returns false when arrays have different lengths', () => {
    const a = [{ type: 'bold' }, { type: 'italic' }]
    const b = [{ type: 'bold' }]
    expect(marksEqual(a, b)).toBe(false)
  })

  it('returns false when one has attrs and the other does not', () => {
    const a = [{ type: 'bold', attrs: { level: 1 } }]
    const b = [{ type: 'bold' }]
    expect(marksEqual(a, b)).toBe(false)
  })

  it('returns true for empty arrays', () => {
    expect(marksEqual([], [])).toBe(true)
  })
})
