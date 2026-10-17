import type { JSONContent, MarkdownRendererHelpers } from '@tiptap/core'
import { describe, expect, it } from 'vite-plus/test'

import {
  DEFAULT_CELL_LINE_SEPARATOR,
  escapeTableCellPipes,
  renderTableToMarkdown,
} from './markdown.js'

function renderInline(node: JSONContent): string {
  if (node.type === 'text') {
    return node.text ?? ''
  }

  return (node.content ?? []).map(child => renderInline(child)).join('')
}

const markdownHelpers: MarkdownRendererHelpers = {
  renderChildren: nodes => {
    if (Array.isArray(nodes)) {
      return nodes.map(node => renderInline(node)).join('')
    }

    return renderInline(nodes)
  },
  wrapInBlock: (prefix, content) => prefix + content,
  indent: content => content,
}

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

describe('renderTableToMarkdown', () => {
  const paragraph = (text: string): JSONContent => ({
    type: 'paragraph',
    content: [{ type: 'text', text }],
  })

  it('does not emit U+001F when a cell has multiple block children', () => {
    const markdown = renderTableToMarkdown(
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [paragraph('line one'), paragraph('line two')] },
              { type: 'tableCell', content: [paragraph('B')] },
            ],
          },
        ],
      },
      markdownHelpers,
    )

    expect(markdown).not.toContain(DEFAULT_CELL_LINE_SEPARATOR)
    expect(markdown).not.toContain('\u001F')
    expect(markdown).toContain('line one<br>line two')
  })

  it('strips a leftover cell-line separator even when it is passed as an option', () => {
    const markdown = renderTableToMarkdown(
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [paragraph('line one'), paragraph('line two')] },
            ],
          },
        ],
      },
      markdownHelpers,
      { cellLineSeparator: DEFAULT_CELL_LINE_SEPARATOR },
    )

    expect(markdown).not.toContain('\u001F')
    expect(markdown).toContain('line one<br>line two')
  })

  it('preserves an empty paragraph when cellLineSeparator is two newlines', () => {
    const markdown = renderTableToMarkdown(
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [paragraph('one'), { type: 'paragraph', content: [] }, paragraph('two')],
              },
            ],
          },
        ],
      },
      markdownHelpers,
      { cellLineSeparator: '\n\n' },
    )

    expect(markdown).toContain('one<br><br>two')
  })
})
