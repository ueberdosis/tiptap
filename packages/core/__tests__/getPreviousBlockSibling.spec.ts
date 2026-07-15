import { getPreviousBlockSibling, getSchemaByResolvedExtensions } from '@tiptap/core'
import Blockquote from '@tiptap/extension-blockquote'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Node } from '@tiptap/pm/model'
import { describe, expect, it } from 'vitest'

const schema = getSchemaByResolvedExtensions([
  Document,
  Paragraph,
  Text,
  Blockquote,
  BulletList,
  ListItem,
])

/**
 * Resolves the position right before the first occurrence of `target` text.
 */
const resolveBefore = (doc: Node, target: string) => {
  let pos = -1

  doc.descendants((node, nodePos) => {
    if (pos !== -1 || !node.isText || !node.text) {
      return
    }

    const offset = node.text.indexOf(target)

    if (offset !== -1) {
      pos = nodePos + offset
    }
  })

  if (pos === -1) {
    throw new Error(`Could not find "${target}" in the document`)
  }

  return doc.resolve(pos)
}

describe('getPreviousBlockSibling', () => {
  it('returns the previous block-level sibling of a top-level paragraph', () => {
    const doc = Node.fromJSON(schema, {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }],
            },
          ],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'B' }] },
      ],
    })

    const previous = getPreviousBlockSibling(resolveBefore(doc, 'B'))

    expect(previous?.type.name).toBe('bulletList')
  })

  it('returns the previous sibling within the same parent', () => {
    const doc = Node.fromJSON(schema, {
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'A' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'B' }] },
          ],
        },
      ],
    })

    const previous = getPreviousBlockSibling(resolveBefore(doc, 'B'))

    expect(previous?.type.name).toBe('paragraph')
    expect(previous?.textContent).toBe('A')
  })

  it('returns null when the cursor is in the first child of its block parent', () => {
    const doc = Node.fromJSON(schema, {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }],
    })

    expect(getPreviousBlockSibling(resolveBefore(doc, 'A'))).toBeNull()
  })

  it('returns null at the top of the document', () => {
    const doc = Node.fromJSON(schema, {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'A' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'B' }] },
      ],
    })

    // resolve(0) has no parent depth to read a sibling from
    expect(getPreviousBlockSibling(doc.resolve(0))).toBeNull()
  })
})
