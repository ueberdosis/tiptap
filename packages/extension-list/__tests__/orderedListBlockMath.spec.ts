import Document from '@tiptap/extension-document'
import { BlockMath } from '@tiptap/extension-mathematics'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vitest'

import { BulletList, ListItem, OrderedList } from '../src/index.js'

describe('block math after an ordered list item', () => {
  const markdownManager = new MarkdownManager({
    extensions: [Document, Paragraph, Text, BulletList, OrderedList, ListItem, BlockMath],
  })

  const blockMath = { type: 'blockMath', attrs: { latex: 'x = 1' } }

  it('ends the list on an unindented "$$" line', () => {
    const json = markdownManager.parse('4. Result\n$$\nx = 1\n$$')

    expect(json).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          attrs: { start: 4 },
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Result' }] }],
            },
          ],
        },
        blockMath,
      ],
    })
  })

  it('keeps an indented "$$" line inside the list item', () => {
    const json = markdownManager.parse('4. Result\n   $$\n   x = 1\n   $$')

    expect(json).toEqual({
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          attrs: { start: 4 },
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Result' }] },
                blockMath,
              ],
            },
          ],
        },
      ],
    })
  })
})
