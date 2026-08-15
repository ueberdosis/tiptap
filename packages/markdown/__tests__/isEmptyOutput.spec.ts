import { describe, expect, it } from 'vitest'

import { isEmptyOutput } from '../src/utils/isEmptyOutput.js'

describe('isEmptyOutput', () => {
  it('returns true for an empty string', () => {
    expect(isEmptyOutput('')).toBe(true)
  })

  it('returns true for whitespace-only strings', () => {
    expect(isEmptyOutput('   ')).toBe(true)
    expect(isEmptyOutput('\n\t  \r\n')).toBe(true)
  })

  it('returns true for only &nbsp; entities', () => {
    expect(isEmptyOutput('&nbsp;')).toBe(true)
    expect(isEmptyOutput('&nbsp;&nbsp; &nbsp;')).toBe(true)
  })

  it('returns true for only non-breaking space characters', () => {
    expect(isEmptyOutput('\u00A0')).toBe(true)
    expect(isEmptyOutput('\u00A0 \u00A0')).toBe(true)
  })

  it('returns false for &amp;nbsp;, which is literal text and not a non-breaking space', () => {
    expect(isEmptyOutput('&amp;nbsp;')).toBe(false)
  })

  it('returns false for output containing meaningful content', () => {
    expect(isEmptyOutput('Hello')).toBe(false)
    expect(isEmptyOutput('&nbsp; &amp;nbsp;')).toBe(false)
  })
})
