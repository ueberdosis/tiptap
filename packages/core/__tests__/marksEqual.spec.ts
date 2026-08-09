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

  it('returns true for same marks in different order', () => {
    const a = [{ type: 'bold' }, { type: 'italic' }]
    const b = [{ type: 'italic' }, { type: 'bold' }]
    expect(marksEqual(a, b)).toBe(true)
  })

  it('returns true for marks with attrs in different order', () => {
    const a = [{ type: 'highlight', attrs: { color: 'red' } }, { type: 'bold' }]
    const b = [{ type: 'bold' }, { type: 'highlight', attrs: { color: 'red' } }]
    expect(marksEqual(a, b)).toBe(true)
  })

  it('returns false for different count of duplicate marks', () => {
    const a = [{ type: 'bold' }, { type: 'bold' }]
    const b = [{ type: 'bold' }]
    expect(marksEqual(a, b)).toBe(false)
  })

  it('accepts marks with type as object (ProseMirror-like)', () => {
    const a = [{ type: { name: 'bold' }, attrs: { level: 1 } }]
    const b = [{ type: { name: 'bold' }, attrs: { level: 1 } }]
    expect(marksEqual(a, b)).toBe(true)
  })

  it('handles mixed type representations', () => {
    const a = [{ type: 'bold', attrs: { level: 1 } }]
    const b = [{ type: { name: 'bold' }, attrs: { level: 1 } }]
    expect(marksEqual(a, b)).toBe(true)
  })

  it('does not match PM attrs:{} against JSON missing attrs', () => {
    // ProseMirror marks always have attrs as an object, JSON marks often omit it.
    // attrsEqual({}, undefined) returns false, so these don't match.
    const a = [{ type: { name: 'bold' }, attrs: {} }]
    const b = [{ type: 'bold' }]
    expect(marksEqual(a, b)).toBe(false)
  })

  it('treats null and undefined attrs as different', () => {
    const a = [{ type: 'bold', attrs: null }]
    const b = [{ type: 'bold' }]
    expect(marksEqual(a, b)).toBe(false)
  })

  it('returns false for ProseMirror marks with different type names', () => {
    const a = [{ type: { name: 'bold' } }]
    const b = [{ type: { name: 'italic' } }]
    expect(marksEqual(a, b)).toBe(false)
  })
})
