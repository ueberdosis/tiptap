import type { Mark } from 'prosemirror-model'
import { AddNodeMarkStep, RemoveNodeMarkStep } from 'prosemirror-transform'
import { describe, expect, it } from 'vite-plus/test'

import { isProseMirrorAddNodeMarkStep } from '../isProseMirrorAddNodeMarkStep.js'

const mark = { toJSON: () => ({ type: 'bold', attrs: {} }) } as unknown as Mark

describe('isProseMirrorAddNodeMarkStep', () => {
  it('returns true for an AddNodeMarkStep', () => {
    expect(isProseMirrorAddNodeMarkStep(new AddNodeMarkStep(1, mark))).toBe(true)
  })

  it('returns false for other steps and values', () => {
    expect(isProseMirrorAddNodeMarkStep(new RemoveNodeMarkStep(1, mark))).toBe(false)
    expect(isProseMirrorAddNodeMarkStep(null)).toBe(false)
    expect(isProseMirrorAddNodeMarkStep({})).toBe(false)
  })
})
