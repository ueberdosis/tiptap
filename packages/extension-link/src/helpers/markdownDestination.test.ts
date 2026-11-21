import { describe, expect, it } from 'vite-plus/test'

import { decodeMarkdownDestination, extractMarkdownDestination } from './markdownDestination.js'

describe('decodeMarkdownDestination', () => {
  it('decodes named character references', () => {
    expect(decodeMarkdownDestination('https://example.com/?a=1&amp;b=2')).toBe(
      'https://example.com/?a=1&b=2',
    )
    expect(decodeMarkdownDestination('https://example.com/it&apos;s')).toBe(
      "https://example.com/it's",
    )
    expect(decodeMarkdownDestination('https://example.com/&copy;')).toBe('https://example.com/©')
  })

  it('decodes numeric character references', () => {
    expect(decodeMarkdownDestination('a&#40;b&#41;c')).toBe('a(b)c')
    expect(decodeMarkdownDestination('a&#x28;b')).toBe('a(b')
  })

  it('decodes one level only', () => {
    expect(decodeMarkdownDestination('a&amp;amp;b')).toBe('a&amp;b')
  })

  it('leaves unknown references alone', () => {
    expect(decodeMarkdownDestination('a&unknown;b')).toBe('a&unknown;b')
    expect(decodeMarkdownDestination('a&b')).toBe('a&b')
  })

  it('resolves backslash escapes before references', () => {
    // `\&` is an escaped ampersand, so `amp;` stays literal
    expect(decodeMarkdownDestination('a\\&amp;b')).toBe('a&amp;b')
  })

  it('resolves escapes for ASCII punctuation only', () => {
    expect(decodeMarkdownDestination('a\\.b')).toBe('a.b')
    expect(decodeMarkdownDestination('a\\(b\\)c')).toBe('a(b)c')
    expect(decodeMarkdownDestination('a\\b')).toBe('a\\b')
  })

  it('returns plain text unchanged', () => {
    expect(decodeMarkdownDestination('https://example.com/docs')).toBe('https://example.com/docs')
  })
})

describe('extractMarkdownDestination', () => {
  it('reads a bare destination', () => {
    expect(extractMarkdownDestination('[x](https://example.com/docs)')).toBe(
      'https://example.com/docs',
    )
  })

  it('stops before a title', () => {
    expect(extractMarkdownDestination('[x](https://example.com/docs "Docs")')).toBe(
      'https://example.com/docs',
    )
  })

  it('keeps balanced parentheses in a bare destination', () => {
    expect(extractMarkdownDestination('[x](https://example.com/a(b)c)')).toBe(
      'https://example.com/a(b)c',
    )
  })

  it('reads an angle bracket destination', () => {
    expect(extractMarkdownDestination('[x](<https://example.com/a b>)')).toBe(
      'https://example.com/a b',
    )
  })

  it('keeps escaped characters in the destination', () => {
    expect(extractMarkdownDestination('[x](a\\&amp;b)')).toBe('a\\&amp;b')
  })

  it('handles a label with nested brackets', () => {
    expect(extractMarkdownDestination('[a [b] c](https://example.com)')).toBe('https://example.com')
  })

  it('returns null for reference links', () => {
    expect(extractMarkdownDestination('[x][ref]')).toBeNull()
  })

  it('returns null when there is no destination', () => {
    expect(extractMarkdownDestination('plain text')).toBeNull()
  })
})
