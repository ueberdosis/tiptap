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

  it('leaves already escaped markers and plain text alone', () => {
    expect(escapeBlockStart('\\# escaped')).toBe('\\# escaped')
    expect(escapeBlockStart('plain text')).toBe('plain text')
    expect(escapeBlockStart('')).toBe('')
  })
})
