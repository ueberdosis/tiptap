import { describe, expect, it } from 'vitest'

import { getDragImageOffset, shouldResetMargin } from '../src/helpers/dragHandler.js'

describe('getDragImageOffset', () => {
  it('anchors ltr previews to the left edge', () => {
    expect(getDragImageOffset('ltr', 180)).toBe(0)
  })

  it('anchors rtl previews to the right edge', () => {
    expect(getDragImageOffset('rtl', 180)).toBe(180)
  })
})

describe('shouldResetMargin', () => {
  it('resets the margin when no properties are provided', () => {
    expect(shouldResetMargin(undefined)).toBe(true)
  })

  it('resets the margin when the properties do not include a margin', () => {
    expect(shouldResetMargin(['color', 'font-size'])).toBe(true)
  })

  it('keeps the margin when the shorthand margin is requested', () => {
    expect(shouldResetMargin(['margin'])).toBe(false)
  })

  it('keeps the margin for longhand and logical margin properties', () => {
    expect(shouldResetMargin(['margin-bottom'])).toBe(false)
    expect(shouldResetMargin(['margin-inline-start'])).toBe(false)
  })

  it('ignores surrounding whitespace in property names', () => {
    expect(shouldResetMargin([' margin-top '])).toBe(false)
  })
})
