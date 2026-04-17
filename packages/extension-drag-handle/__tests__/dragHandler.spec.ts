import { describe, expect, it } from 'vitest'

import { getDragImageOffset } from '../src/helpers/dragHandler.js'

describe('getDragImageOffset', () => {
  it('anchors ltr previews to the left edge', () => {
    expect(getDragImageOffset('ltr', 180)).toBe(0)
  })

  it('anchors rtl previews to the right edge', () => {
    expect(getDragImageOffset('rtl', 180)).toBe(180)
  })
})
