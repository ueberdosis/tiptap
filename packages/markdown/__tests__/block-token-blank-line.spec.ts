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

  // marked's heading tokenizer matches a trailing `\n+`, so the blank lines that
  // follow a heading are absorbed into the heading token's `raw` and no `space`
  // token is emitted. Empty paragraphs must still be recovered from that gap,
  // otherwise one blank line is dropped on every parse/serialize round-trip.
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
    const markdown = '# Title\n\n\n\n&nbsp;\n\n&nbsp;\n\nBody'

    const once = markdownManager.serialize(markdownManager.parse(markdown))
    const twice = markdownManager.serialize(markdownManager.parse(once))

    // Stable across repeated parse/serialize cycles (no blank-line erosion).
    expect(twice).toBe(once)
    expect(once).toBe(markdown)
  })

  // Tables share the same failure: marked's table tokenizer also absorbs the
  // trailing blank lines into the table token's `raw`.
  it('preserves a blank line between a table and the following text', () => {
    const doc = markdownManager.parse('| a | b |\n| --- | --- |\n| 1 | 2 |\n\n\n\nAfter')
    const kinds = (doc.content ?? []).map(node => node.type)

    expect(kinds).toEqual(['table', 'paragraph', 'paragraph'])
    expect(doc.content?.[1]).toEqual({ type: 'paragraph', content: [] })
  })
})
