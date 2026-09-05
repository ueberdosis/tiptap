import { describe, expect, it } from 'vite-plus/test'

import { escapeTableCellPipes } from './markdown.js'

describe('escapeTableCellPipes', () => {
  it('escapes a bare pipe inside a code span', () => {
    expect(escapeTableCellPipes('| `a|b` |')).toBe('| `a\\|b` |')
  })

  it('escapes every pipe of a consecutive run', () => {
    expect(escapeTableCellPipes('| `||` |')).toBe('| `\\|\\|` |')
  })

  it('keeps an already-escaped pipe untouched', () => {
    expect(escapeTableCellPipes('| `a\\|b` |')).toBe('| `a\\|b` |')
  })

  it('keeps a pipe preceded by a backslash pair untouched', () => {
    expect(escapeTableCellPipes('| `a\\\\|b` |')).toBe('| `a\\\\|b` |')
  })

  it('handles mixed escaped and bare pipes in one span', () => {
    expect(escapeTableCellPipes('| `|\\||` |')).toBe('| `\\|\\|\\|` |')
  })
})
