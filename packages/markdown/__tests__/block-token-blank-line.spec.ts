import { Blockquote } from '@tiptap/extension-blockquote'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Blank lines after a block token', () => {
  let markdownManager: MarkdownManager

  beforeEach(() => {
    markdownManager = new MarkdownManager({
      extensions: [
        Document,
        Paragraph,
        Text,
        Heading,
        Blockquote,
        BulletList,
        OrderedList,
        ListItem,
        Table,
        TableRow,
        TableHeader,
        TableCell,
      ],
    })
  })

  // Heading tokenizer absorbs trailing blank lines into the token's raw,
  // so we recover them here to prevent losing a blank line per parse cycle.
  it('preserves a blank line between a heading and the following text', () => {
    const doc = markdownManager.parse('# Title\n\n\n\nBody')

    expect(doc.content).toEqual([
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] },
      { type: 'paragraph', content: [] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Body' }] },
    ])
  })

  it('does not create an empty paragraph when a heading is directly followed by text', () => {
    const doc = markdownManager.parse('# Title\n\nBody')

    expect(doc.content).toEqual([
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Body' }] },
    ])
  })

  it('round-trips blank lines after a heading without eroding them', () => {
    const markdown = '# Title\n\n\n\nBody'

    const once = markdownManager.serialize(markdownManager.parse(markdown))
    const twice = markdownManager.serialize(markdownManager.parse(once))

    // Stable across repeated cycles (no erosion).
    expect(twice).toBe(once)
  })

  // A lone `&nbsp;` paragraph is an empty-paragraph marker, not verbatim
  // content, so it normalizes to blank-line spacing (see paragraph.spec.ts).
  // What must hold is that the blank line is not eroded across cycles.
  it('normalizes an explicit &nbsp; paragraph without eroding the blank line', () => {
    const once = markdownManager.serialize(markdownManager.parse('# Title\n\n&nbsp;\n\nBody'))
    const twice = markdownManager.serialize(markdownManager.parse(once))

    expect(once).toBe('# Title\n\n\n\nBody')
    expect(twice).toBe(once)
  })

  // Tables absorb trailing blank lines the same way.
  it('preserves a blank line between a table and the following text', () => {
    const doc = markdownManager.parse('| a | b |\n| --- | --- |\n| 1 | 2 |\n\n\n\nAfter')
    const kinds = (doc.content ?? []).map(node => node.type)

    expect(kinds).toEqual(['table', 'paragraph', 'paragraph'])
    expect(doc.content?.[1]).toEqual({ type: 'paragraph', content: [] })
  })

  // HTML blocks absorb trailing blank lines the same way.
  it('preserves a blank line after a raw HTML block (parsed as paragraph)', () => {
    const doc = markdownManager.parse('<div>test</div>\n\n\n\nAfter')
    const kinds = (doc.content ?? []).map(node => node.type)

    expect(kinds).toEqual(['paragraph', 'paragraph', 'paragraph'])
    expect(doc.content?.[1]).toEqual({ type: 'paragraph', content: [] })
  })
})
