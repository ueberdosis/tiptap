import type { Mark } from '@tiptap/pm/model'
import { AddNodeMarkStep, RemoveNodeMarkStep } from '@tiptap/pm/transform'
import { describe, expect, it } from 'vitest'

import { isProseMirrorRemoveNodeMarkStep } from '../isProseMirrorRemoveNodeMarkStep.js'

const mark = { toJSON: () => ({ type: 'bold', attrs: {} }) } as unknown as Mark

describe('isProseMirrorRemoveNodeMarkStep', () => {
  it('returns true for a RemoveNodeMarkStep', () => {
    expect(isProseMirrorRemoveNodeMarkStep(new RemoveNodeMarkStep(1, mark))).toBe(true)
  })

  it('returns false for other steps and values', () => {
    expect(isProseMirrorRemoveNodeMarkStep(new AddNodeMarkStep(1, mark))).toBe(false)
    expect(isProseMirrorRemoveNodeMarkStep(null)).toBe(false)
    expect(isProseMirrorRemoveNodeMarkStep({})).toBe(false)
  })
})
