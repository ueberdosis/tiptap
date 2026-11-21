import { describe, expect, it } from 'vite-plus/test'

import { escapeMarkdownDestination } from './escapeMarkdownDestination.js'

describe('escapeMarkdownDestination', () => {
  it('returns a plain URL unchanged', () => {
    expect(escapeMarkdownDestination('https://example.com/docs')).toBe('https://example.com/docs')
  })

  it('encodes ampersands so a literal entity survives a second parse', () => {
    expect(escapeMarkdownDestination('a&b')).toBe('a&amp;b')
    expect(escapeMarkdownDestination('a&amp;b')).toBe('a&amp;amp;b')
  })

  it('encodes parentheses that would end the destination', () => {
    expect(escapeMarkdownDestination('https://example.com/a(b)c')).toBe(
      'https://example.com/a&#40;b&#41;c',
    )
  })

  it('encodes whitespace', () => {
    expect(escapeMarkdownDestination('a b')).toBe('a&#32;b')
    expect(escapeMarkdownDestination('a\nb')).toBe('a&#10;b')
  })

  it('encodes angle brackets', () => {
    expect(escapeMarkdownDestination('<a>')).toBe('&lt;a&gt;')
  })

  it('encodes literal backslashes', () => {
    expect(escapeMarkdownDestination('a\\b')).toBe('a\\\\b')
  })

  it('leaves an empty destination empty', () => {
    expect(escapeMarkdownDestination('')).toBe('')
  })
})
