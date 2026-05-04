import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vitest'

describe('table markdown alignment', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, HardBreak, Paragraph, Text, TableKit],
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

  it('should preserve <br> line breaks inside table cells (round-trip)', () => {
    const markdown = `| desc |
| --- |
| a<br>b<br>c |`

    const serialized = markdownManager.serialize(markdownManager.parse(markdown))

    expect(serialized).toContain('a<br>b<br>c')
  })
})
