import { Blockquote } from '@tiptap/extension-blockquote'
import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { BulletList, ListItem, TaskItem, TaskList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

describe('hard break in a heading', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, Heading, HardBreak],
  })

  const heading = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [
          { type: 'text', text: 'Title' },
          { type: 'hardBreak' },
          { type: 'text', text: 'second line' },
        ],
      },
    ],
  }

  it('keeps the heading on one line', () => {
    expect(markdownManager.serialize(heading)).toBe('# Title<br>second line')
  })

  it('round-trips to the same heading', () => {
    const parsed = markdownManager.parse(markdownManager.serialize(heading))

    expect(parsed).toEqual(heading)
  })

  it('still writes a hard break in a paragraph as a markdown line break', () => {
    const paragraph = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'a' },
            { type: 'hardBreak' },
            { type: 'text', text: 'b' },
          ],
        },
      ],
    }

    expect(markdownManager.serialize(paragraph)).toBe('a  \nb')
  })
})

describe('hard break in other blocks', () => {
  const markdownManager = new MarkdownManager({
    extensions: [
      Document,
      Paragraph,
      Text,
      HardBreak,
      Blockquote,
      BulletList,
      ListItem,
      TaskList,
      TaskItem,
      Table,
      TableRow,
      TableHeader,
      TableCell,
    ],
  })

  const paragraph = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'a' }, { type: 'hardBreak' }, { type: 'text', text: 'b' }],
  }

  it.each([
    ['a blockquote', { type: 'blockquote', content: [paragraph] }, '> a  \n> b'],
    [
      'a list item',
      { type: 'bulletList', content: [{ type: 'listItem', content: [paragraph] }] },
      '- a  \nb',
    ],
    [
      'a task item',
      {
        type: 'taskList',
        content: [{ type: 'taskItem', attrs: { checked: false }, content: [paragraph] }],
      },
      '- [ ] a  \n  b',
    ],
    [
      'a table cell',
      {
        type: 'table',
        content: [
          { type: 'tableRow', content: [{ type: 'tableHeader', content: [paragraph] }] },
          { type: 'tableRow', content: [{ type: 'tableCell', content: [paragraph] }] },
        ],
      },
      '| a<br>b |',
    ],
  ])('round-trips in %s', (_name, block, markdown) => {
    const doc = { type: 'doc', content: [block] }
    const serialized = markdownManager.serialize(doc)

    expect(serialized).toContain(markdown)
    expect(markdownManager.parse(serialized)).toEqual(doc)
  })
})
