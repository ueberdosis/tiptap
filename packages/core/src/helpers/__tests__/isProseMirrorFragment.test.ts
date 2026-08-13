import { Fragment } from '@tiptap/pm/model'
import { describe, expect, it } from 'vitest'

import { isProseMirrorFragment } from '../isProseMirrorFragment.js'

describe('isProseMirrorFragment', () => {
  it('returns true for a fragment', () => {
    expect(isProseMirrorFragment(Fragment.empty)).toBe(true)
  })

  it('returns false for other values', () => {
    expect(isProseMirrorFragment(null)).toBe(false)
    expect(isProseMirrorFragment('text')).toBe(false)
    expect(isProseMirrorFragment({ size: 0 })).toBe(false)
    expect(
      isProseMirrorFragment({
        content: [],
        size: 0,
        nodesBetween: () => {},
        descendants: () => {},
        textBetween: () => {},
        append: () => {},
        cut: () => {},
      }),
    ).toBe(false)
  })
})
