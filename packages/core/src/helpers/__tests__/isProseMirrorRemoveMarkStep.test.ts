import type { Mark } from '@tiptap/pm/model'
import { AddMarkStep, RemoveMarkStep } from '@tiptap/pm/transform'
import { describe, expect, it } from 'vitest'

import { isProseMirrorRemoveMarkStep } from '../isProseMirrorRemoveMarkStep.js'

const mark = { toJSON: () => ({ type: 'bold', attrs: {} }) } as unknown as Mark

describe('isProseMirrorRemoveMarkStep', () => {
  it('returns true for a RemoveMarkStep', () => {
    expect(isProseMirrorRemoveMarkStep(new RemoveMarkStep(1, 5, mark))).toBe(true)
  })

  it('returns false for other steps and values', () => {
    expect(isProseMirrorRemoveMarkStep(new AddMarkStep(1, 5, mark))).toBe(false)
    expect(isProseMirrorRemoveMarkStep(null)).toBe(false)
    expect(isProseMirrorRemoveMarkStep({})).toBe(false)
  })
})
