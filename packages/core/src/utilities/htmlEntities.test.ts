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
    expect(decodeHtmlEntities('&#8212;')).toBe('\u2014')
  })

  it('handles doubly-encoded numeric entities like &amp;#39;', () => {
    expect(decodeHtmlEntities('&amp;#39;')).toBe('&#39;')
  })

  it('leaves decimal references over 7 digits as a literal (exceeds CommonMark digit limit)', () => {
    expect(decodeHtmlEntities('&#999999999;')).toBe('&#999999999;')
  })

  it('leaves hex references over 6 digits as a literal (exceeds CommonMark digit limit)', () => {
    expect(decodeHtmlEntities('&#xFFFFFFFF;')).toBe('&#xFFFFFFFF;')
  })

  it('leaves an 8-digit decimal reference as a literal (format exceeds the limit)', () => {
    expect(decodeHtmlEntities('&#12345678;')).toBe('&#12345678;')
  })

  it('replaces a 7-digit decimal reference whose value exceeds 0x10FFFF with U+FFFD', () => {
    expect(decodeHtmlEntities('&#1114112;')).toBe('\uFFFD')
  })

  it('replaces a 6-digit hex reference whose value exceeds 0x10FFFF with U+FFFD', () => {
    expect(decodeHtmlEntities('&#xFFFFFF;')).toBe('\uFFFD')
  })

  it('matches a 7-digit decimal reference greedily and leaves the trailing digit as a literal', () => {
    expect(decodeHtmlEntities('&#1234567;8')).toBe('\uFFFD8')
  })

  it('replaces &#0; (NUL) with U+FFFD', () => {
    expect(decodeHtmlEntities('&#0;')).toBe('\uFFFD')
  })

  it('replaces a lone low surrogate &#xD800; with U+FFFD', () => {
    expect(decodeHtmlEntities('&#xD800;')).toBe('\uFFFD')
  })

  it('replaces a lone high surrogate &#xDFFF; with U+FFFD', () => {
    expect(decodeHtmlEntities('&#xDFFF;')).toBe('\uFFFD')
  })

  it('decodes &#xD7FF; normally (just below the surrogate range)', () => {
    expect(decodeHtmlEntities('&#xD7FF;')).toBe(String.fromCodePoint(0xd7ff))
  })

  it('decodes &#xE000; normally (just above the surrogate range)', () => {
    expect(decodeHtmlEntities('&#xE000;')).toBe(String.fromCodePoint(0xe000))
  })

  it('decodes &#x10FFFF; normally (the maximum valid code point)', () => {
    expect(decodeHtmlEntities('&#x10FFFF;')).toBe(String.fromCodePoint(0x10ffff))
  })

  it('remaps &#128; (0x80) to the Windows-1252 euro sign', () => {
    expect(decodeHtmlEntities('&#128;')).toBe('\u20AC')
  })

  it('remaps &#151; (0x97) to the Windows-1252 em dash', () => {
    expect(decodeHtmlEntities('&#151;')).toBe('\u2014')
  })

  it('remaps &#147; (0x93) to the Windows-1252 left double quote', () => {
    expect(decodeHtmlEntities('&#147;')).toBe('\u201C')
  })

  it('remaps &#148; (0x94) to the Windows-1252 right double quote', () => {
    expect(decodeHtmlEntities('&#148;')).toBe('\u201D')
  })

  it('remaps &#x80; (hex form) to the Windows-1252 euro sign', () => {
    expect(decodeHtmlEntities('&#x80;')).toBe('\u20AC')
  })

  it('leaves &#129; (0x81) as the raw C1 control character (not in the Windows-1252 table)', () => {
    expect(decodeHtmlEntities('&#129;')).toBe('\u0081')
  })

  it('leaves &#141; (0x8D) as the raw C1 control character (not in the Windows-1252 table)', () => {
    expect(decodeHtmlEntities('&#141;')).toBe('\u008D')
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

  it('decode is a superset of encode - &quot; decodes but " is not encoded', () => {
    // " passes through encode unchanged, &quot; decodes to "
    expect(encodeHtmlEntities('"hello"')).toBe('"hello"')
    expect(decodeHtmlEntities('&quot;hello&quot;')).toBe('"hello"')
  })
})
