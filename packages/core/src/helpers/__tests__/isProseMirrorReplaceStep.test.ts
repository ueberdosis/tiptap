import { ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform'
import { Slice } from '@tiptap/pm/model'
import { describe, expect, it } from 'vitest'

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
