import { getSchema } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'
import { Node } from '@tiptap/pm/model'
import { describe, expect, it } from 'vite-plus/test'

import { BulletList, ListItem } from '../../src/index.js'

const extensions = [Document, Paragraph, Text, Heading, BulletList, ListItem]

const parse = (markdown: string) => {
  const manager = new MarkdownManager({ extensions })
  const json = manager.parse(markdown)
  const doc = Node.fromJSON(getSchema(extensions), json)

  return { manager, json, doc }
}

describe('ListItem markdown', () => {
  describe('parsing', () => {
    it('returns schema-valid content when a bare nested marker becomes a setext heading', () => {
      const markdown = '- Item with empty sub item\n  - \n- Next\n'

      expect(() => parse(markdown).doc.check()).not.toThrow()
    })
  })

  describe('rendering', () => {
    it('does not render an empty nested item as a bare marker', () => {
      const manager = new MarkdownManager({ extensions })
      const emptyItem = { type: 'listItem', content: [{ type: 'paragraph' }] }
      const markdown = manager.serialize({
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Item' }] },
                  { type: 'bulletList', content: [emptyItem] },
                ],
              },
            ],
          },
        ],
      })

      expect(markdown).toBe('- Item\n  - &nbsp;')
    })

    it('keeps the parent text a paragraph after a round trip', () => {
      const manager = new MarkdownManager({ extensions })
      const markdown = manager.serialize({
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Item' }] },
                  {
                    type: 'bulletList',
                    content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }],
                  },
                ],
              },
            ],
          },
        ],
      })
      const { json } = parse(markdown)

      expect(json.content[0].content[0].content[0].type).toBe('paragraph')
    })
  })
})
