import { describe, expect, it } from 'vitest'

import { decodeHtmlEntities, encodeHtmlEntities } from '../utilities/htmlEntities.js'

describe('decodeHtmlEntities', () => {
  it('decodes &lt; to <', () => {
    expect(decodeHtmlEntities('&lt;div&gt;')).toBe('<div>')
  })

  it('decodes &amp; to &', () => {
    expect(decodeHtmlEntities('a &amp; b')).toBe('a & b')
  })

  it('decodes &quot; to "', () => {
    expect(decodeHtmlEntities('&quot;hello&quot;')).toBe('"hello"')
  })

  it('handles doubly-encoded sequences like &amp;lt;', () => {
    expect(decodeHtmlEntities('&amp;lt;')).toBe('&lt;')
  })

  it('returns plain text unchanged', () => {
    expect(decodeHtmlEntities('hello world')).toBe('hello world')
  })
})

describe('encodeHtmlEntities', () => {
  it('encodes < to &lt;', () => {
    expect(encodeHtmlEntities('<div>')).toBe('&lt;div&gt;')
  })

  it('encodes & to &amp;', () => {
    expect(encodeHtmlEntities('a & b')).toBe('a &amp; b')
  })

  it('encodes " to &quot;', () => {
    expect(encodeHtmlEntities('"hello"')).toBe('&quot;hello&quot;')
  })

  it('returns plain text unchanged', () => {
    expect(encodeHtmlEntities('hello world')).toBe('hello world')
  })
})

describe('roundtrip', () => {
  it.each(['<div>', 'a & b', '"quoted"', '<a href="url">link</a>', 'x < y & y > z'])(
    'encode then decode roundtrips: %s',
    input => {
      expect(decodeHtmlEntities(encodeHtmlEntities(input))).toBe(input)
    },
  )
})
