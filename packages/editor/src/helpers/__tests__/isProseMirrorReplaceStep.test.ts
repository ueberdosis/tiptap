import { ReplaceAroundStep, ReplaceStep } from 'prosemirror-transform'
import { Slice } from 'prosemirror-model'
import { describe, expect, it } from 'vite-plus/test'

import { isProseMirrorReplaceStep } from '../isProseMirrorReplaceStep.js'

describe('isProseMirrorReplaceStep', () => {
  it('returns true for a ReplaceStep', () => {
    expect(isProseMirrorReplaceStep(new ReplaceStep(1, 5, Slice.empty))).toBe(true)
  })

  it('returns false for other steps and values', () => {
    expect(isProseMirrorReplaceStep(new ReplaceAroundStep(1, 5, 2, 4, Slice.empty, 0))).toBe(false)
    expect(isProseMirrorReplaceStep(null)).toBe(false)
    expect(isProseMirrorReplaceStep({})).toBe(false)
  })
})
