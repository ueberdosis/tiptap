import { ReplaceAroundStep, ReplaceStep } from 'prosemirror-transform'
import { Slice } from 'prosemirror-model'
import { describe, expect, it } from 'vite-plus/test'

import { isProseMirrorReplaceAroundStep } from '../isProseMirrorReplaceAroundStep.js'

describe('isProseMirrorReplaceAroundStep', () => {
  it('returns true for a ReplaceAroundStep', () => {
    expect(isProseMirrorReplaceAroundStep(new ReplaceAroundStep(1, 5, 2, 4, Slice.empty, 0))).toBe(
      true,
    )
  })

  it('returns false for other steps and values', () => {
    expect(isProseMirrorReplaceAroundStep(new ReplaceStep(1, 5, Slice.empty))).toBe(false)
    expect(isProseMirrorReplaceAroundStep(null)).toBe(false)
    expect(isProseMirrorReplaceAroundStep({})).toBe(false)
  })
})
