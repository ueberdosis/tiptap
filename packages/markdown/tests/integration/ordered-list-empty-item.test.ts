import { Document } from '@tiptap/extension-document'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { MarkdownManager } from '../../src/MarkdownManager.js'

describe('Empty ordered list items', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem],
  })

  it('parses an empty ordered list item into a list item with an empty paragraph', () => {
    const doc = markdownManager.parse('1. text\n2. ')

    expect(doc.content?.[0]).toEqual({
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'text' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [] }],
        },
      ],
    })
  })

  it('round-trips an empty ordered list item instead of throwing', () => {
    expect(markdownManager.serialize(markdownManager.parse('1. text\n2. '))).toBe('1. text\n2. ')
    expect(markdownManager.serialize(markdownManager.parse('1. a\n2. \n3. c'))).toBe(
      '1. a\n2. \n3. c',
    )
  })
})
