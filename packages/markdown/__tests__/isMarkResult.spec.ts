import { describe, expect, it } from 'vitest'

import { isMarkResult } from '../src/utils/isMarkResult.js'

describe('isMarkResult', () => {
  it('should accept a mark with content', () => {
    expect(isMarkResult({ mark: 'bold', content: [{ type: 'text', text: 'hello' }] })).toBe(true)
  })

  it('should accept a mark with content and attrs', () => {
    expect(
      isMarkResult({
        mark: 'link',
        content: [{ type: 'text', text: 'hello' }],
        attrs: { href: 'https://tiptap.dev' },
      }),
    ).toBe(true)
  })

  it('should reject an object with a mark but no content', () => {
    expect(isMarkResult({ mark: 'bold' })).toBe(false)
  })

  it('should reject an object with a non-array content', () => {
    expect(isMarkResult({ mark: 'bold', content: 'not an array' })).toBe(false)
  })

  it('should reject a non-string mark', () => {
    expect(isMarkResult({ mark: 42, content: [] })).toBe(false)
  })

  it('should reject null attrs', () => {
    expect(isMarkResult({ mark: 'bold', content: [], attrs: null })).toBe(false)
  })

  it('should reject array attrs', () => {
    expect(isMarkResult({ mark: 'bold', content: [], attrs: [] })).toBe(false)
  })

  it('should reject unrelated objects', () => {
    expect(isMarkResult({ type: 'paragraph' })).toBe(false)
    expect(isMarkResult(null)).toBe(false)
    expect(isMarkResult(undefined)).toBe(false)
    expect(isMarkResult('bold')).toBe(false)
    expect(isMarkResult(['bold'])).toBe(false)
  })
})
