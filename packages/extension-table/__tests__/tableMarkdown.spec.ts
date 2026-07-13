import { Code } from '@tiptap/extension-code'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vitest'

describe('table markdown — inline code with pipe characters', () => {
  const manager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Code, TableKit],
  })

  it('should parse `||` inside a code span as a single cell', () => {
    const markdown = '| Header |\n| ------ |\n| `||` |'
    const parsed = manager.parse(markdown)
    const bodyRow = parsed.content?.[0]?.content?.[1]?.content || []
    expect(bodyRow).toHaveLength(1)
    const textNode = bodyRow[0]?.content?.[0]?.content?.[0]
    expect(textNode?.text).toBe('||')
    expect(textNode?.marks?.[0]?.type).toBe('code')
  })

  it('should parse `a || b` inside a code span as a single cell', () => {
    const markdown = '| H | H | H |\n| - | - | - |\n| `||` | or | `a || b` |'
    const parsed = manager.parse(markdown)
    const table = parsed.content?.[0]
    expect(table?.type).toBe('table')
    const bodyRow = table?.content?.[1]?.content || []
    expect(bodyRow).toHaveLength(3)

    const cell1 = bodyRow[0]?.content?.[0]?.content?.[0]
    expect(cell1?.text).toBe('||')
    expect(cell1?.marks?.[0]?.type).toBe('code')

    const cell2 = bodyRow[1]?.content?.[0]?.content?.[0]
    expect(cell2?.text).toBe('or')
    expect(cell2?.marks).toBeUndefined()

    const cell3 = bodyRow[2]?.content?.[0]?.content?.[0]
    expect(cell3?.text).toBe('a || b')
    expect(cell3?.marks?.[0]?.type).toBe('code')
  })

  it('should parse `&&` inside a code span correctly (regression guard)', () => {
    const markdown = '| H | H | H |\n| - | - | - |\n| `&&` | and | `a && b` |'
    const parsed = manager.parse(markdown)
    const bodyRow = parsed.content?.[0]?.content?.[1]?.content || []
    expect(bodyRow).toHaveLength(3)
    const cell1 = bodyRow[0]?.content?.[0]?.content?.[0]
    expect(cell1?.text).toBe('&&')
    expect(cell1?.marks?.[0]?.type).toBe('code')
    const cell3 = bodyRow[2]?.content?.[0]?.content?.[0]
    expect(cell3?.text).toBe('a && b')
    expect(cell3?.marks?.[0]?.type).toBe('code')
  })

  it('should roundtrip table with inline code containing pipes', () => {
    const markdown = '| H |\n| - |\n| `a || b` |'
    const parsed = manager.parse(markdown)
    const serialized = manager.serialize(parsed)
    const reparsed = manager.parse(serialized)
    const cell = reparsed.content?.[0]?.content?.[1]?.content?.[0]?.content?.[0]?.content?.[0]
    expect(cell?.text).toBe('a || b')
    expect(cell?.marks?.[0]?.type).toBe('code')
  })

  it('should not affect table cells without backtick spans', () => {
    const markdown = '| a | b |\n| - | - |\n| 1 | 2 |'
    const parsed = manager.parse(markdown)
    const bodyRow = parsed.content?.[0]?.content?.[1]?.content || []
    expect(bodyRow).toHaveLength(2)
    expect(bodyRow[0]?.content?.[0]?.content?.[0]?.text).toBe('1')
    expect(bodyRow[1]?.content?.[0]?.content?.[0]?.text).toBe('2')
  })

  it('should not corrupt content that follows a table with inline code containing pipes', () => {
    const markdown = '| H |\n| - |\n| `a || b` |\n\nParagraph after.'
    const parsed = manager.parse(markdown)
    expect(parsed.content).toHaveLength(2)
    expect(parsed.content?.[0]?.type).toBe('table')
    expect(parsed.content?.[1]?.type).toBe('paragraph')
    expect(parsed.content?.[1]?.content?.[0]?.text).toBe('Paragraph after.')
  })

  it('should not affect inline code with pipes outside of tables', () => {
    const markdown = 'Use `a || b` for logical or.'
    const parsed = manager.parse(markdown)
    // Must parse as a paragraph, not accidentally as a table
    const block = parsed.content?.[0]
    expect(block?.type).toBe('paragraph')
    // The code mark must be present on one of the inline nodes
    const codeNode = block?.content?.find(n => n.marks?.some(m => m.type === 'code'))
    expect(codeNode).toBeDefined()
    expect(codeNode?.marks?.[0]?.type).toBe('code')
  })

  it('should treat a setext heading with pipe in title as a heading, not a table', () => {
    // '`a | b`\n---' is a setext h2, not a table. Our tokenizer must not
    // activate on it and must not contaminate the inline queue via
    // helper.blockTokens (which would turn '|' into '\|' in the output).
    const markdown = '`a | b`\n---'
    const parsed = manager.parse(markdown)
    const block = parsed.content?.[0]
    expect(block?.type).toBe('heading')
    // The pipe must be preserved verbatim inside the code span.
    const codeNode = block?.content?.find((n: any) => n.marks?.some((m: any) => m.type === 'code'))
    expect(codeNode?.text).toBe('a | b')
  })

  it('should parse `||` inside a code span in a pipeless table as a single cell', () => {
    const markdown = 'Expression | Meaning\n---------- | -------\n`||` | or'
    const parsed = manager.parse(markdown)
    const table = parsed.content?.[0]
    expect(table?.type).toBe('table')
    const bodyRow = table?.content?.[1]?.content || []
    expect(bodyRow).toHaveLength(2)
    const cell1 = bodyRow[0]?.content?.[0]?.content?.[0]
    expect(cell1?.text).toBe('||')
    expect(cell1?.marks?.[0]?.type).toBe('code')
    const cell2 = bodyRow[1]?.content?.[0]?.content?.[0]
    expect(cell2?.text).toBe('or')
  })

  it('should not corrupt content that follows a pipeless table with inline code containing pipes', () => {
    const markdown = 'H1 | H2\n-- | --\n`a || b` | x\n\nParagraph after.'
    const parsed = manager.parse(markdown)
    expect(parsed.content).toHaveLength(2)
    expect(parsed.content?.[0]?.type).toBe('table')
    expect(parsed.content?.[1]?.type).toBe('paragraph')
    expect(parsed.content?.[1]?.content?.[0]?.text).toBe('Paragraph after.')
  })

  it('should include a no-pipe body row as a table row, matching marked native behavior', () => {
    // marked treats any non-blank line before the blank line as a table body row,
    // even if it contains no pipe. Our tokenizer must not cut it off into a paragraph.
    const markdown = 'A | B\n--- | ---\n`a || b` | c\njust some text\n\nAfter'
    const parsed = manager.parse(markdown)
    const table = parsed.content?.[0]
    expect(table?.type).toBe('table')
    // 2 body rows: "`a || b` | c" and "just some text"
    expect(table?.content).toHaveLength(3) // header row + 2 body rows
    expect(parsed.content?.[1]?.type).toBe('paragraph')
    expect(parsed.content?.[1]?.content?.[0]?.text).toBe('After')
  })
})

describe('table markdown alignment', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, TableKit],
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
})
