import { getStyleProperty } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

describe('getStyleProperty', () => {
  it('returns null when the element has no style attribute', () => {
    const el = document.createElement('span')

    expect(getStyleProperty(el, 'font-family')).toBeNull()
  })

  it('returns null when the requested property is not declared', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'color: red')

    expect(getStyleProperty(el, 'font-family')).toBeNull()
  })

  it('returns the raw value preserving original formatting', () => {
    const el = document.createElement('span')
    el.setAttribute('style', "font-family: 'Comic Sans MS', cursive")

    expect(getStyleProperty(el, 'font-family')).toBe("'Comic Sans MS', cursive")
  })

  it('returns the last declaration when the property is declared multiple times', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'color: red; color: blue')

    expect(getStyleProperty(el, 'color')).toBe('blue')
  })

  it('matches the property name case-insensitively', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'FONT-FAMILY: Inter')

    expect(getStyleProperty(el, 'font-family')).toBe('Inter')
  })

  it('preserves colons that appear inside the value (e.g. URLs)', () => {
    const el = document.createElement('span')
    el.setAttribute('style', "background-image: url('https://example.com/img.png')")

    expect(getStyleProperty(el, 'background-image')).toBe("url('https://example.com/img.png')")
  })

  it('ignores trailing semicolons and extra whitespace', () => {
    const el = document.createElement('span')
    el.setAttribute('style', '  font-size:    16px  ;  ')

    expect(getStyleProperty(el, 'font-size')).toBe('16px')
  })
})
