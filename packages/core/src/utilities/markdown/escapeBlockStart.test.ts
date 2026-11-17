import { describe, expect, it } from 'vite-plus/test'

import { escapeBlockStart } from './escapeBlockStart.js'

describe('escapeBlockStart', () => {
  it('escapes heading markers', () => {
    expect(escapeBlockStart('# Title')).toBe('\\# Title')
    expect(escapeBlockStart('## Title')).toBe('\\## Title')
    expect(escapeBlockStart('#')).toBe('\\#')
    expect(escapeBlockStart('#hashtag')).toBe('#hashtag')
    expect(escapeBlockStart('####### too many')).toBe('####### too many')
  })

  it('escapes bullet markers', () => {
    expect(escapeBlockStart('- item')).toBe('\\- item')
    expect(escapeBlockStart('+ item')).toBe('\\+ item')
    expect(escapeBlockStart('* item')).toBe('\\* item')
    expect(escapeBlockStart('-')).toBe('\\-')
    expect(escapeBlockStart('-foo')).toBe('-foo')
  })

  it('escapes thematic break runs', () => {
    expect(escapeBlockStart('---')).toBe('\\---')
    expect(escapeBlockStart('***')).toBe('\\***')
    expect(escapeBlockStart('___')).toBe('\\___')
    expect(escapeBlockStart('* * *')).toBe('\\* * *')
    expect(escapeBlockStart('_ _ _')).toBe('\\_ _ _')
  })

  it('escapes ordered markers', () => {
    expect(escapeBlockStart('1. January')).toBe('1\\. January')
    expect(escapeBlockStart('10) October')).toBe('10\\) October')
    expect(escapeBlockStart('1.')).toBe('1\\.')
    expect(escapeBlockStart('1.5 times')).toBe('1.5 times')
    expect(escapeBlockStart('2024 was good')).toBe('2024 was good')
  })

  it('escapes quote markers', () => {
    expect(escapeBlockStart('> quoted')).toBe('\\> quoted')
    expect(escapeBlockStart('>> nested')).toBe('\\>> nested')
  })

  it('leaves emphasis delimiters alone', () => {
    expect(escapeBlockStart('**bold**')).toBe('**bold**')
    expect(escapeBlockStart('*italic*')).toBe('*italic*')
    expect(escapeBlockStart('***both***')).toBe('***both***')
    expect(escapeBlockStart('_italic_')).toBe('_italic_')
  })

  it('escapes markers after leading spaces and on later lines', () => {
    expect(escapeBlockStart('  - indented')).toBe('  \\- indented')
    expect(escapeBlockStart('first\n- second')).toBe('first\n\\- second')
    expect(escapeBlockStart('first\n1. second')).toBe('first\n1\\. second')
  })

  it('escapes Setext underlines after a text line', () => {
    expect(escapeBlockStart('Title\n===')).toBe('Title\n\\===')
    expect(escapeBlockStart('Title\n=')).toBe('Title\n\\=')
    expect(escapeBlockStart('Title\n===   ')).toBe('Title\n\\===   ')
    expect(escapeBlockStart('Title\n  ===')).toBe('Title\n  \\===')
    expect(escapeBlockStart('`x`\n===')).toBe('`x`\n\\===')
  })

  it('leaves equals runs that cannot be Setext underlines alone', () => {
    expect(escapeBlockStart('===\nTitle')).toBe('===\nTitle')
    expect(escapeBlockStart('Title\n\n===')).toBe('Title\n\n===')
    expect(escapeBlockStart('a === b')).toBe('a === b')
    expect(escapeBlockStart('Title\n= = =')).toBe('Title\n= = =')
    expect(escapeBlockStart('Title\n=== x')).toBe('Title\n=== x')
  })

  it('escapes pipes in GFM table delimiter rows', () => {
    expect(escapeBlockStart('a | b\n| --- | --- |\nc | d')).toBe(
      'a | b\n\\| --- \\| --- \\|\nc | d',
    )
    expect(escapeBlockStart('a | b\n--- | ---\nc | d')).toBe('a | b\n\\--- \\| ---\nc | d')
    expect(escapeBlockStart('a | b\n| :--- | ---: |\nc | d')).toBe(
      'a | b\n\\| :--- \\| ---: \\|\nc | d',
    )
    expect(escapeBlockStart('ab\n| --- |\ncd')).toBe('ab\n\\| --- \\|\ncd')
    expect(escapeBlockStart('a | b\n:--- | --- |\nc | d')).toBe('a | b\n:--- \\| --- \\|\nc | d')
  })

  it('escapes a leading list marker on a table delimiter row', () => {
    expect(escapeBlockStart('a | b\n- | -\nc | d')).toBe('a | b\n\\- \\| -\nc | d')
    expect(escapeBlockStart('a | b\n-- | --\nc | d')).toBe('a | b\n\\-- \\| --\nc | d')
  })

  it('leaves pipes alone outside table delimiter rows', () => {
    expect(escapeBlockStart('| --- |')).toBe('| --- |')
    expect(escapeBlockStart('a\n\n| --- |')).toBe('a\n\n| --- |')
    expect(escapeBlockStart('a | b\nc | d')).toBe('a | b\nc | d')
    expect(escapeBlockStart('a | b\n| --- | foo |\nc | d')).toBe('a | b\n| --- | foo |\nc | d')
  })

  it('leaves markers inside inline code spans alone', () => {
    expect(escapeBlockStart('`# not a heading`')).toBe('`# not a heading`')
    expect(escapeBlockStart('Title\n`===`')).toBe('Title\n`===`')
    expect(escapeBlockStart('`x` - y')).toBe('`x` - y')
  })

  it('flattens newlines inside inline code spans to spaces', () => {
    expect(escapeBlockStart('`a\n2. b`')).toBe('`a 2. b`')
    expect(escapeBlockStart('`Title\n===`')).toBe('`Title ===`')
    expect(escapeBlockStart('``a `b`\n1. d``')).toBe('``a `b` 1. d``')
    expect(escapeBlockStart('`a\n# b`')).toBe('`a # b`')
    expect(escapeBlockStart('`a\n- b`')).toBe('`a - b`')
    expect(escapeBlockStart('`a\n1. b`')).toBe('`a 1. b`')
    expect(escapeBlockStart('`a\n> b`')).toBe('`a > b`')
    expect(escapeBlockStart('x `a\n# b` y')).toBe('x `a # b` y')
  })

  it('still escapes markers on lines around inline code spans', () => {
    expect(escapeBlockStart('before\n`a\n2. b`\n- after')).toBe('before\n`a 2. b`\n\\- after')
    expect(escapeBlockStart('\\`not code\n- item')).toBe('\\`not code\n\\- item')
  })

  it('leaves already escaped markers and plain text alone', () => {
    expect(escapeBlockStart('\\# escaped')).toBe('\\# escaped')
    expect(escapeBlockStart('plain text')).toBe('plain text')
    expect(escapeBlockStart('')).toBe('')
  })
})
