import { describe, expect, it } from 'vitest'

import { escapeMarkdownSyntax } from '../src/utils/escapeMarkdownSyntax.js'

describe('escapeMarkdownSyntax', () => {
  it('escapes backslashes', () => {
    expect(escapeMarkdownSyntax('\\')).toBe('\\\\')
  })

  it('escapes backticks', () => {
    expect(escapeMarkdownSyntax('`')).toBe('\\`')
  })

  it('escapes asterisks', () => {
    expect(escapeMarkdownSyntax('*')).toBe('\\*')
  })

  it('escapes underscores', () => {
    expect(escapeMarkdownSyntax('_')).toBe('\\_')
  })

  it('escapes opening square brackets', () => {
    expect(escapeMarkdownSyntax('[')).toBe('\\[')
  })

  it('escapes closing square brackets', () => {
    expect(escapeMarkdownSyntax(']')).toBe('\\]')
  })

  it('escapes tildes', () => {
    expect(escapeMarkdownSyntax('~')).toBe('\\~')
  })

  it('leaves ordinary text unchanged', () => {
    expect(escapeMarkdownSyntax('Hello world')).toBe('Hello world')
    expect(escapeMarkdownSyntax('123abc !?.,')).toBe('123abc !?.,')
  })

  it('escapes every delimiter within a single string', () => {
    expect(escapeMarkdownSyntax('a*b_c[d]e~f`g\\h')).toBe('a\\*b\\_c\\[d\\]e\\~f\\`g\\\\h')
  })
})
