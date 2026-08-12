import { Slice } from '@tiptap/pm/model'
import { describe, expect, it } from 'vitest'

import { isProseMirrorSlice } from '../isProseMirrorSlice.js'

describe('isProseMirrorSlice', () => {
  it('returns true for a slice', () => {
    expect(isProseMirrorSlice(Slice.empty)).toBe(true)
  })

  it('returns false for other values', () => {
    expect(isProseMirrorSlice(null)).toBe(false)
    expect(isProseMirrorSlice('text')).toBe(false)
    expect(isProseMirrorSlice({ openStart: 0, openEnd: 0 })).toBe(false)
  })
})
