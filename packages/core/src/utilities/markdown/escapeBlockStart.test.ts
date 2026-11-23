import { describe, expect, it } from 'vite-plus/test'

import { escapeBlockStart, escapeLinkTitle } from './escapeBlockStart.js'

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

  it('flattens each CRLF or lone CR inside inline code spans to one space', () => {
    expect(escapeBlockStart('`a\r\n2. b`')).toBe('`a 2. b`')
    expect(escapeBlockStart('`a\r2. b`')).toBe('`a 2. b`')
    expect(escapeBlockStart('`a\r\n# b`')).toBe('`a # b`')
    expect(escapeBlockStart('`a\r\n\r\n# b`')).toBe('`a  # b`')
  })

  it('leaves newlines alone when no later line of a code span starts a block', () => {
    expect(escapeBlockStart('`a\nb`')).toBe('`a\nb`')
    expect(escapeBlockStart('`a\r\nb`')).toBe('`a\r\nb`')
    expect(escapeBlockStart('[x](https://example.com "`a\nb`")')).toBe(
      '[x](https://example.com "`a\nb`")',
    )
  })

  it('flattens newlines before HTML block starts inside inline code spans', () => {
    expect(escapeBlockStart('`a\n<div>\nb`')).toBe('`a <div> b`')
    expect(escapeBlockStart('`a\n</div>\nb`')).toBe('`a </div> b`')
    expect(escapeBlockStart('`a\n<table>\nb`')).toBe('`a <table> b`')
    expect(escapeBlockStart('`a\n<!-- note -->\nb`')).toBe('`a <!-- note --> b`')
  })

  it('flattens newlines before fence starts inside inline code spans', () => {
    expect(escapeBlockStart('`a\n~~~\nb`')).toBe('`a ~~~ b`')
    expect(escapeBlockStart('`a\n```\nb`')).toBe('`a ``` b`')
    expect(escapeBlockStart('`a\n```js\nb`')).toBe('`a ```js b`')
    expect(escapeBlockStart('`a\n~~~\n# b`')).toBe('`a ~~~ # b`')
  })

  it('leaves lines that cannot start a block alone inside inline code spans', () => {
    expect(escapeBlockStart('`a\n``\nb`')).toBe('`a\n``\nb`')
  })

  it('escapes block markers on later lines of a link title', () => {
    expect(escapeLinkTitle('`a\n# b`')).toBe('`a\n\\# b`')
    expect(escapeLinkTitle('`a\n- b`')).toBe('`a\n\\- b`')
    expect(escapeLinkTitle('`a\n<div>`')).toBe('`a\n\\<div>`')
    expect(escapeLinkTitle('`a\n~~~\nb`')).toBe('`a\n\\~~~\nb`')
    expect(escapeLinkTitle('`a | b\n| --- | --- |`')).toBe('`a | b\n\\| --- \\| --- \\|`')
    expect(escapeLinkTitle('`a\nb`')).toBe('`a\nb`')
    expect(escapeLinkTitle('a\n# b')).toBe('a\n\\# b')
  })

  it('flattens a code span split by a blank line', () => {
    expect(escapeBlockStart('`a\n\n# b`')).toBe('`a  # b`')
    expect(escapeBlockStart('`a\n\nb`')).toBe('`a  b`')
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
