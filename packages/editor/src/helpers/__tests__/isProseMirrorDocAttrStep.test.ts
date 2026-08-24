import { DocAttrStep, ReplaceStep } from 'prosemirror-transform'
import { Slice } from 'prosemirror-model'
import { describe, expect, it } from 'vite-plus/test'

import { isProseMirrorDocAttrStep } from '../isProseMirrorDocAttrStep.js'

describe('isProseMirrorDocAttrStep', () => {
  it('returns true for a DocAttrStep', () => {
    expect(isProseMirrorDocAttrStep(new DocAttrStep('title', 'demo'))).toBe(true)
  })

  it('returns false for other steps and values', () => {
    expect(isProseMirrorDocAttrStep(new ReplaceStep(1, 5, Slice.empty))).toBe(false)
    expect(isProseMirrorDocAttrStep(null)).toBe(false)
    expect(isProseMirrorDocAttrStep({})).toBe(false)
  })
})
