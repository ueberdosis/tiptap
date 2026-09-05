import { describe, expect, it } from 'vite-plus/test'

import { isInDecorationApplyScope, runInDecorationApplyScope } from './decorationApplyScope.js'

describe('decorationApplyScope', () => {
  it('marks the editor only while the callback runs', () => {
    const editor = {}

    expect(isInDecorationApplyScope(editor)).toBe(false)

    runInDecorationApplyScope(editor, () => {
      expect(isInDecorationApplyScope(editor)).toBe(true)
    })

    expect(isInDecorationApplyScope(editor)).toBe(false)
  })

  it('keeps the mark until the outermost scope exits', () => {
    const editor = {}

    runInDecorationApplyScope(editor, () => {
      runInDecorationApplyScope(editor, () => {})

      expect(isInDecorationApplyScope(editor)).toBe(true)
    })

    expect(isInDecorationApplyScope(editor)).toBe(false)
  })

  it('clears the mark when the callback throws', () => {
    const editor = {}

    expect(() =>
      runInDecorationApplyScope(editor, () => {
        throw new Error('boom')
      }),
    ).toThrow('boom')

    expect(isInDecorationApplyScope(editor)).toBe(false)
  })

  it('tracks editors independently', () => {
    const first = {}
    const second = {}

    runInDecorationApplyScope(first, () => {
      expect(isInDecorationApplyScope(second)).toBe(false)
    })
  })
})
