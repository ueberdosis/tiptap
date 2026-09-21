import { describe, expect, it } from 'vite-plus/test'

import { decodeHtmlEntities, encodeHtmlEntities } from './htmlEntities.js'

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

  it('decodes decimal numeric entities like &#39;', () => {
    expect(decodeHtmlEntities('it&#39;s')).toBe("it's")
  })

  it('decodes hex numeric entities like &#x27;', () => {
    expect(decodeHtmlEntities('&#x27;')).toBe("'")
  })

  it('decodes decimal numeric entities for non-ASCII characters like &#8212;', () => {
    expect(decodeHtmlEntities('&#8212;')).toBe('—')
  })

  it('handles doubly-encoded numeric entities like &amp;#39;', () => {
    expect(decodeHtmlEntities('&amp;#39;')).toBe('&#39;')
  })

  it('leaves out-of-range decimal numeric entities untouched', () => {
    expect(decodeHtmlEntities('&#999999999;')).toBe('&#999999999;')
  })

  it('leaves out-of-range hex numeric entities untouched', () => {
    expect(decodeHtmlEntities('&#xFFFFFFFF;')).toBe('&#xFFFFFFFF;')
  })

  it('does not re-scan replaced output for a second round of decoding', () => {
    expect(decodeHtmlEntities('&#38;#x27;')).toBe('&#x27;')
  })

  it('does not turn a decoded &amp; into a second-pass &lt; decode', () => {
    expect(decodeHtmlEntities('&#38;lt;')).toBe('&lt;')
  })

  it('does not turn a decoded &amp; into a second-pass &amp; decode', () => {
    expect(decodeHtmlEntities('&#38;amp;')).toBe('&amp;')
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

  it('does not encode " (quotes are valid in markdown)', () => {
    expect(encodeHtmlEntities('"hello"')).toBe('"hello"')
  })

  it('returns plain text unchanged', () => {
    expect(encodeHtmlEntities('hello world')).toBe('hello world')
  })
})

describe('roundtrip', () => {
  it.each(['<div>', 'a & b', 'x < y & y > z'])('encode then decode roundtrips: %s', input => {
    expect(decodeHtmlEntities(encodeHtmlEntities(input))).toBe(input)
  })

  it('decode is a superset of encode – &quot; decodes but " is not encoded', () => {
    // " passes through encode unchanged, &quot; decodes to "
    expect(encodeHtmlEntities('"hello"')).toBe('"hello"')
    expect(decodeHtmlEntities('&quot;hello&quot;')).toBe('"hello"')
  })
})
