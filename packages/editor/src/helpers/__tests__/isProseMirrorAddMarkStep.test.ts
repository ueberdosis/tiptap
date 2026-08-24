import type { Mark } from 'prosemirror-model'
import { AddMarkStep, RemoveMarkStep } from 'prosemirror-transform'
import { describe, expect, it } from 'vite-plus/test'

import { isProseMirrorAddMarkStep } from '../isProseMirrorAddMarkStep.js'

const mark = { toJSON: () => ({ type: 'bold', attrs: {} }) } as unknown as Mark

describe('isProseMirrorAddMarkStep', () => {
  it('returns true for an AddMarkStep', () => {
    expect(isProseMirrorAddMarkStep(new AddMarkStep(1, 5, mark))).toBe(true)
  })

  it('returns false for other steps and values', () => {
    expect(isProseMirrorAddMarkStep(new RemoveMarkStep(1, 5, mark))).toBe(false)
    expect(isProseMirrorAddMarkStep(null)).toBe(false)
    expect(isProseMirrorAddMarkStep({})).toBe(false)
  })
})
