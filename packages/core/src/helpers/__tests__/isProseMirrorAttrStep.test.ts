import { AttrStep, ReplaceStep } from '@tiptap/pm/transform'
import { Slice } from '@tiptap/pm/model'
import { describe, expect, it } from 'vitest'

import { isProseMirrorAttrStep } from '../isProseMirrorAttrStep.js'

describe('isProseMirrorAttrStep', () => {
  it('returns true for an AttrStep', () => {
    expect(isProseMirrorAttrStep(new AttrStep(1, 'src', 'image.png'))).toBe(true)
  })

  it('returns false for other steps and values', () => {
    expect(isProseMirrorAttrStep(new ReplaceStep(1, 5, Slice.empty))).toBe(false)
    expect(isProseMirrorAttrStep(null)).toBe(false)
    expect(isProseMirrorAttrStep({})).toBe(false)
  })
})
