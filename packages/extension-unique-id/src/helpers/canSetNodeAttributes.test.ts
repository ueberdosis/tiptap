import type { Node as PMNode } from '@tiptap/pm/model'
import { Schema } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { describe, expect, it } from 'vite-plus/test'

import { canSetNodeAttributes } from './canSetNodeAttributes.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      attrs: { id: { default: null } },
    },
    // Exactly two paragraphs, like a two-column layout.
    pair: {
      group: 'block',
      content: 'paragraph paragraph',
      attrs: { id: { default: null } },
    },
    // A paragraph first, then any blocks, like a list item.
    item: {
      group: 'block',
      content: 'paragraph block*',
      attrs: { id: { default: null } },
    },
    divider: { group: 'block', atom: true, attrs: { id: { default: null } } },
    image: { group: 'inline', inline: true, attrs: { id: { default: null } } },
    text: { group: 'inline' },
  },
})

const { nodes } = schema

// `create` skips the content check, which lets the tests build invalid nodes.
const doc = (...children: PMNode[]) => nodes.doc.create(null, children)
const paragraph = (text = 'Text') => nodes.paragraph.create(null, text ? schema.text(text) : null)
const pair = (...children: PMNode[]) => nodes.pair.create(null, children)
const item = (...children: PMNode[]) => nodes.item.create(null, children)
const divider = () => nodes.divider.create()

/** Position of the first node of the given type at the given depth. */
function findPos(root: PMNode, typeName: string, depth: number) {
  let found = -1
  root.descendants((node, pos) => {
    if (found < 0 && node.type.name === typeName && root.resolve(pos).depth === depth) {
      found = pos
    }
  })
  if (found < 0) {
    throw new Error(`No ${typeName} at depth ${depth}`)
  }
  return found
}

/** Whether ProseMirror really lets the attributes of the node at `pos` change. */
function proseMirrorAccepts(root: PMNode, pos: number) {
  const attempts = [
    () => EditorState.create({ doc: root }).tr.setNodeAttribute(pos, 'id', 'x'),
    () => EditorState.create({ doc: root }).tr.setNodeMarkup(pos, undefined, { id: 'x' }),
  ]
  return attempts.every(attempt => {
    try {
      attempt()
      return true
    } catch {
      return false
    }
  })
}

function expectCanSet(root: PMNode, pos: number, expected: boolean) {
  expect(canSetNodeAttributes(root, pos)).toBe(expected)
  // The helper must predict what ProseMirror does, both ways.
  expect(proseMirrorAccepts(root, pos)).toBe(expected)
}

describe('canSetNodeAttributes', () => {
  describe('valid content', () => {
    it('accepts a block at the top level', () => {
      const root = doc(paragraph(), paragraph())
      expectCanSet(root, findPos(root, 'paragraph', 0), true)
    })

    it('accepts an empty block whose content may be empty', () => {
      const root = doc(paragraph(''))
      expectCanSet(root, 0, true)
    })

    it('accepts a container whose children match its schema', () => {
      const root = doc(pair(paragraph('Left'), paragraph('Right')))
      expectCanSet(root, findPos(root, 'pair', 0), true)
    })

    it('accepts a child of a valid container', () => {
      const root = doc(item(paragraph(), divider()))
      expectCanSet(root, findPos(root, 'paragraph', 1), true)
    })

    it('accepts a leaf block', () => {
      const root = doc(paragraph(), divider())
      expectCanSet(root, findPos(root, 'divider', 0), true)
    })

    it('accepts an inline node in a valid text block', () => {
      const root = doc(nodes.paragraph.create(null, nodes.image.create()))
      expectCanSet(root, findPos(root, 'image', 1), true)
    })
  })

  describe('a node whose own content breaks the schema', () => {
    it('rejects a container with too few children', () => {
      const root = doc(pair(paragraph()))
      expectCanSet(root, findPos(root, 'pair', 0), false)
    })

    it('rejects a container with too many children', () => {
      const root = doc(pair(paragraph(), paragraph(), paragraph()))
      expectCanSet(root, findPos(root, 'pair', 0), false)
    })

    it('rejects an empty container that requires children', () => {
      const root = doc(pair())
      expectCanSet(root, findPos(root, 'pair', 0), false)
    })

    it('rejects a container with children in the wrong order', () => {
      const root = doc(item(divider(), paragraph()))
      expectCanSet(root, findPos(root, 'item', 0), false)
    })

    it('rejects a container with a child of the wrong type', () => {
      const root = doc(pair(paragraph(), divider()))
      expectCanSet(root, findPos(root, 'pair', 0), false)
    })
  })

  describe('a node whose parent breaks the schema', () => {
    it('rejects a valid child of a container with too few children', () => {
      const root = doc(pair(paragraph()))
      expectCanSet(root, findPos(root, 'paragraph', 1), false)
    })

    it('rejects a leaf child of a container in the wrong order', () => {
      const root = doc(item(divider(), paragraph()))
      expectCanSet(root, findPos(root, 'divider', 1), false)
    })

    it('rejects a valid container inside an invalid one', () => {
      const root = doc(item(pair(paragraph(), paragraph())))
      expectCanSet(root, findPos(root, 'pair', 1), false)
    })

    it('rejects a top-level block of a document that breaks its schema', () => {
      // An inline node directly in the document, which only takes blocks.
      const root = doc(paragraph(), nodes.image.create())
      expectCanSet(root, 0, false)
    })
  })

  describe('a node deeper inside an invalid node', () => {
    it('accepts a grandchild whose own parent is valid', () => {
      const root = doc(item(pair(paragraph('Left'), paragraph('Right'))))
      expectCanSet(root, findPos(root, 'paragraph', 2), true)
    })
  })

  describe('a position without a node', () => {
    it('rejects the end of the document', () => {
      const root = doc(paragraph())
      expect(canSetNodeAttributes(root, root.content.size)).toBe(false)
    })

    it('rejects an empty document', () => {
      const root = nodes.doc.create(null, [])
      expect(canSetNodeAttributes(root, 0)).toBe(false)
    })
  })
})
