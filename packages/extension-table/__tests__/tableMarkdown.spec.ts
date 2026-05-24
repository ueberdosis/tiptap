import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import HardBreak from '@tiptap/extension-hard-break'
import { describe, expect, it } from 'vitest'

describe('table markdown alignment', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, TableKit, HardBreak],
  })

  it('should parse and serialize left/right/center table alignment', () => {
    const markdown = `| left | right | center |
| :---- | ----: | :-----: |
| a | b | c |`

    const parsed = markdownManager.parse(markdown)
    const table = parsed.content?.[0]

    expect(table?.type).toBe('table')

    const headerCells = table?.content?.[0]?.content || []

    expect(headerCells[0]?.attrs?.align).toBe('left')
    expect(headerCells[1]?.attrs?.align).toBe('right')
    expect(headerCells[2]?.attrs?.align).toBe('center')

    const serialized = markdownManager.serialize(parsed)

    expect(serialized).toContain('| left | right | center |')
    expect(serialized).toMatch(/\|\s*:[-]+\s*\|\s*[-]+:\s*\|\s*:[-]+:\s*\|/)
  })

  it('should preserve <br> line breaks inside table cells during round-trip serialization', () => {
    // We use <br> syntax inside Markdown because literal newlines break markdown tables
    const markdown = `| desc |
| --- |
| foo<br>bar |`

    // Parse the markdown into the editor
    const parsed = markdownManager.parse(markdown)

    // Serialize it back, it should preserve the <br> instead of collapsing it
    const serialized = markdownManager.serialize(parsed)

    expect(serialized).toContain('foo<br>bar')
    expect(serialized).not.toContain('foo bar')
  })
})
