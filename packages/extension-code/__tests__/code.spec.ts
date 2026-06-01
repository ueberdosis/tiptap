import { inputRegex, inputRegexMatch, pasteRegex, pasteRegexMatch } from '@tiptap/extension-code'
import { describe, expect, it } from 'vitest'

describe('code inputRegexMatch', () => {
  it('matches basic backtick code', () => {
    const result = inputRegexMatch('`code`')
    expect(result).not.toBeNull()
    expect(result!.replaceWith).toBe('code')
    expect(result!.text).toBe('`code`')
    expect(result!.index).toBe(0)
  })

  it('matches backtick code preceded by a non-backtick character', () => {
    const result = inputRegexMatch('a`code`')
    expect(result).not.toBeNull()
    expect(result!.replaceWith).toBe('code')
    expect(result!.text).toBe('`code`')
    // match starts at the opening backtick, not at 'a'
    expect(result!.index).toBe(1)
  })

  it('matches backtick code preceded by whitespace', () => {
    const result = inputRegexMatch(' `code`')
    expect(result).not.toBeNull()
    expect(result!.replaceWith).toBe('code')
    expect(result!.text).toBe('`code`')
    expect(result!.index).toBe(1)
  })

  it('matches backtick code preceded by multiple characters', () => {
    const result = inputRegexMatch('hello`code`')
    expect(result).not.toBeNull()
    expect(result!.replaceWith).toBe('code')
    expect(result!.index).toBe(5)
  })

  it('does not match when preceded by a backtick', () => {
    expect(inputRegexMatch('``code`')).toBeNull()
  })

  it('does not match with empty content', () => {
    expect(inputRegexMatch('``')).toBeNull()
  })

  it('does not match with no closing backtick', () => {
    expect(inputRegexMatch('`code')).toBeNull()
  })

  it('does not match plain text', () => {
    expect(inputRegexMatch('code')).toBeNull()
  })

  it('matches only the last pair when there are multiple pairs', () => {
    const result = inputRegexMatch('`first` middle `second`')
    expect(result).not.toBeNull()
    expect(result!.replaceWith).toBe('second')
    expect(result!.text).toBe('`second`')
  })
})

describe('code pasteRegexMatch', () => {
  it('matches basic backtick code', () => {
    const results = pasteRegexMatch('`code`')
    expect(results).toHaveLength(1)
    expect(results[0].replaceWith).toBe('code')
    expect(results[0].text).toBe('`code`')
  })

  it('matches backtick code preceded by non-backtick character', () => {
    const results = pasteRegexMatch('a`code`')
    expect(results).toHaveLength(1)
    expect(results[0].replaceWith).toBe('code')
    expect(results[0].text).toBe('`code`')
    expect(results[0].index).toBe(1)
  })

  it('matches backtick code preceded by whitespace', () => {
    const results = pasteRegexMatch(' `code`')
    expect(results).toHaveLength(1)
    expect(results[0].replaceWith).toBe('code')
  })

  it('does not match when preceded by a backtick', () => {
    const results = pasteRegexMatch('``code`')
    expect(results).toHaveLength(0)
  })

  it('does not match empty content', () => {
    expect(pasteRegexMatch('``')).toHaveLength(0)
  })

  it('does not match plain text', () => {
    expect(pasteRegexMatch('code')).toHaveLength(0)
  })

  it('matches multiple code spans in pasted text', () => {
    const results = pasteRegexMatch('`a` and `b`')
    expect(results).toHaveLength(2)
    expect(results[0].replaceWith).toBe('a')
    expect(results[1].replaceWith).toBe('b')
  })

  it('does not match code spans preceded by backtick within pasted text', () => {
    // ``a` should NOT match because it's preceded by a backtick
    // but `b` should match
    const results = pasteRegexMatch('``a` and `b`')
    expect(results).toHaveLength(1)
    expect(results[0].replaceWith).toBe('b')
  })
})

describe('code inputRegex (deprecated regex export)', () => {
  it('matches basic backtick code (backward compat)', () => {
    expect('`code`').toMatch(inputRegex)
  })
})

describe('code pasteRegex (deprecated regex export)', () => {
  it('matches basic backtick code (backward compat)', () => {
    expect('`code`').toMatch(pasteRegex)
  })
})
