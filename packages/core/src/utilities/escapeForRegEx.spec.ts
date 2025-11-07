import { describe, expect, it } from 'vitest'

import { escapeForRegEx } from '../utilities/escapeForRegEx.js'

describe('escapeForRegEx', () => {
  it('escapes hyphen', () => {
    expect(escapeForRegEx('test-string')).toBe('test\\-string')
  })

  it('escapes forward slash', () => {
    expect(escapeForRegEx('path/to/file')).toBe('path\\/to\\/file')
  })

  it('escapes backslash', () => {
    expect(escapeForRegEx('path\\to\\file')).toBe('path\\\\to\\\\file')
  })

  it('escapes caret', () => {
    expect(escapeForRegEx('^start')).toBe('\\^start')
  })

  it('escapes dollar sign', () => {
    expect(escapeForRegEx('end$')).toBe('end\\$')
  })

  it('escapes asterisk', () => {
    expect(escapeForRegEx('wild*card')).toBe('wild\\*card')
  })

  it('escapes plus sign', () => {
    expect(escapeForRegEx('one+')).toBe('one\\+')
  })

  it('escapes question mark', () => {
    expect(escapeForRegEx('maybe?')).toBe('maybe\\?')
  })

  it('escapes dot', () => {
    expect(escapeForRegEx('file.txt')).toBe('file\\.txt')
  })

  it('escapes parentheses', () => {
    expect(escapeForRegEx('(group)')).toBe('\\(group\\)')
  })

  it('escapes pipe', () => {
    expect(escapeForRegEx('option1|option2')).toBe('option1\\|option2')
  })

  it('escapes square brackets', () => {
    expect(escapeForRegEx('[abc]')).toBe('\\[abc\\]')
  })

  it('escapes curly braces', () => {
    expect(escapeForRegEx('{1,3}')).toBe('\\{1,3\\}')
  })

  it('leaves normal characters unchanged', () => {
    expect(escapeForRegEx('hello world 123')).toBe('hello world 123')
  })

  it('handles empty string', () => {
    expect(escapeForRegEx('')).toBe('')
  })

  it('escapes all special characters in one string', () => {
    expect(escapeForRegEx('^test.*+?(file)[abc]{1,3}$')).toBe('\\^test\\.\\*\\+\\?\\(file\\)\\[abc\\]\\{1,3\\}\\$')
  })

  it('handles strings with only special characters', () => {
    expect(escapeForRegEx('.*+?')).toBe('\\.\\*\\+\\?')
  })

  it('handles already escaped strings', () => {
    expect(escapeForRegEx('already\\.escaped')).toBe('already\\\\\\.escaped')
  })

  it('preserves spaces and other non-special characters', () => {
    expect(escapeForRegEx('hello world! @#$%')).toBe('hello world! @#\\$%')
  })
})
