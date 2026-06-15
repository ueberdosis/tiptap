import { parseAttributes, serializeAttributes } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

describe('parseAttributes', () => {
  it('parses a class', () => {
    expect(parseAttributes('.foo')).toEqual({ class: 'foo' })
  })

  it('parses an id', () => {
    expect(parseAttributes('#hello .foo')).toEqual({ id: 'hello', class: 'foo' })
  })

  it('parses an id that starts with a number', () => {
    expect(parseAttributes('#2123 .foo')).toEqual({ id: '2123', class: 'foo' })
  })

  it('parses an id that starts with a number followed by letters', () => {
    expect(parseAttributes('#5hello .foo')).toEqual({ id: '5hello', class: 'foo' })
  })

  it('parses an id without a class', () => {
    expect(parseAttributes('#2123')).toEqual({ id: '2123' })
  })

  it('does not treat a numeric-leading id as a boolean attribute', () => {
    // Regression: the id text must be consumed, not left behind as a boolean attr.
    const result = parseAttributes('#5hello')
    expect(result).toEqual({ id: '5hello' })
    expect(result['5hello']).toBeUndefined()
  })

  it('keeps class parsing intact alongside ids and key-value pairs', () => {
    expect(parseAttributes('.btn #submit disabled type="button"')).toEqual({
      class: 'btn',
      id: 'submit',
      disabled: true,
      type: 'button',
    })
  })

  it('still ignores invalid class names that start with a number', () => {
    // Classes intentionally require a leading letter; this should not become a class.
    expect(parseAttributes('.2foo')).toEqual({})
  })

  it('round-trips a numeric-leading id through serialize/parse', () => {
    const attrs = { id: '2123', class: 'foo' }
    expect(parseAttributes(serializeAttributes(attrs))).toEqual(attrs)
  })
})
