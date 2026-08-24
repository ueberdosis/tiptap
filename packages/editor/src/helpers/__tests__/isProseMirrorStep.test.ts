import { ReplaceStep } from 'prosemirror-transform'
import { Slice } from 'prosemirror-model'
import { describe, expect, it } from 'vite-plus/test'

import { isProseMirrorStep } from '../isProseMirrorStep.js'

describe('isProseMirrorStep', () => {
  it('returns true for a step', () => {
    expect(isProseMirrorStep(new ReplaceStep(1, 5, Slice.empty))).toBe(true)
  })

  it('returns true for an object with the step shape', () => {
    const stepShape = {
      apply: () => {},
      getMap: () => {},
      invert: () => {},
      map: () => {},
      merge: () => {},
      toJSON: () => {},
    }

    expect(isProseMirrorStep(stepShape)).toBe(true)
  })

  it('returns false for other values', () => {
    expect(isProseMirrorStep(null)).toBe(false)
    expect(isProseMirrorStep('step')).toBe(false)
    expect(isProseMirrorStep({})).toBe(false)
  })
})
