import { parseAttributes } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

describe('parseAttributes', () => {
  it('should return an empty object for empty input', () => {
    expect(parseAttributes('')).toEqual({})
    expect(parseAttributes('   ')).toEqual({})
  })

  it('should parse classes', () => {
    expect(parseAttributes('.btn .primary')).toEqual({ class: 'btn primary' })
  })

  it('should parse ids', () => {
    expect(parseAttributes('#submit')).toEqual({ id: 'submit' })
  })

  it('should parse key-value pairs', () => {
    expect(parseAttributes('type="button"')).toEqual({ type: 'button' })
  })

  it('should parse boolean attributes', () => {
    expect(parseAttributes('disabled')).toEqual({ disabled: true })
  })

  it('should parse mixed attribute strings', () => {
    expect(parseAttributes('.btn #submit disabled type="button"')).toEqual({
      class: 'btn',
      id: 'submit',
      disabled: true,
      type: 'button',
    })
  })

  it('should not parse classes or ids inside quoted values', () => {
    expect(parseAttributes('title="#not-an-id .not-a-class"')).toEqual({
      title: '#not-an-id .not-a-class',
    })
  })

  it('should parse ids starting with a number', () => {
    expect(parseAttributes('#2123 .foo')).toEqual({ class: 'foo', id: '2123' })
  })

  it('should parse ids with a leading number followed by letters', () => {
    expect(parseAttributes('#5hello .foo')).toEqual({ class: 'foo', id: '5hello' })
  })

  it('should parse classes starting with a number', () => {
    expect(parseAttributes('.2xl #foo')).toEqual({ class: '2xl', id: 'foo' })
  })
})
