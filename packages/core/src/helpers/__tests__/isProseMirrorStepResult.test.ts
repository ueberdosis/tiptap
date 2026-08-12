import { describe, expect, it } from 'vitest'

import { isProseMirrorStepResult } from '../isProseMirrorStepResult.js'

describe('isProseMirrorStepResult', () => {
  it('returns true for a success and a failure result', () => {
    expect(isProseMirrorStepResult({ doc: {}, failed: null })).toBe(true)
    expect(isProseMirrorStepResult({ doc: null, failed: 'boom' })).toBe(true)
  })

  it('returns false for other values', () => {
    expect(isProseMirrorStepResult({ doc: {}, failed: 'boom' })).toBe(false)
    expect(isProseMirrorStepResult({ doc: null, failed: null })).toBe(false)
    expect(isProseMirrorStepResult(null)).toBe(false)
    expect(isProseMirrorStepResult({})).toBe(false)
  })
})
