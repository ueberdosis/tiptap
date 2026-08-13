import type { Mark } from '@tiptap/pm/model'
import { AddNodeMarkStep, RemoveNodeMarkStep } from '@tiptap/pm/transform'
import { describe, expect, it } from 'vitest'

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
