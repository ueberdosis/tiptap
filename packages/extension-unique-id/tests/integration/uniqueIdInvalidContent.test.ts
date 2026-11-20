// @vitest-environment happy-dom
import { type Extensions, type JSONContent, Editor, Extension, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

import { generateUniqueIds } from '../../src/generate-unique-ids.js'
import { UniqueID } from '../../src/unique-id.js'

// A node whose children can break its schema: a concurrent edit synced from
// another client, or content loaded without a content check, can leave one in
// the document. ProseMirror renders it, but refuses any step that changes the
// attributes of that node or of its children.

const ATTR = 'uniqueId'

// Exactly two paragraphs, like a two-column layout.
const Pair = Node.create({
  name: 'pair',
  group: 'block',
  content: 'paragraph paragraph',
  renderHTML: () => ['div', { 'data-type': 'pair' }, 0],
})

// A paragraph first, then any blocks, like a list item.
const Item = Node.create({
  name: 'item',
  group: 'block',
  content: 'paragraph block*',
  renderHTML: () => ['div', { 'data-type': 'item' }, 0],
})

// A leaf block, which has no content to break.
const Divider = Node.create({
  name: 'divider',
  group: 'block',
  atom: true,
  renderHTML: () => ['hr'],
})

const TYPES = ['paragraph', 'pair', 'item', 'divider']

let idCounter = 0
function generateID() {
  idCounter += 1
  return `id-${idCounter}`
}

function uniqueIdExtension() {
  return UniqueID.configure({ attributeName: ATTR, types: TYPES, generateID })
}

function extensions(options: { withCollaboration?: boolean } = {}): Extensions {
  const list: Extensions = [Document, Paragraph, Text, Pair, Item, Divider, uniqueIdExtension()]
  if (options.withCollaboration) {
    list.push(Extension.create({ name: 'collaboration' }))
  }
  return list
}

function createEditor(content: JSONContent[], options: { withCollaboration?: boolean } = {}) {
  idCounter = 0
  return new Editor({ extensions: extensions(options), content: { type: 'doc', content } })
}

function paragraph(text: string): JSONContent {
  return { type: 'paragraph', content: [{ type: 'text', text }] }
}

// A pair with one paragraph instead of two: its own content is invalid.
const pairWithOneParagraph: JSONContent = {
  type: 'pair',
  content: [paragraph('Lonely')],
}

// An item that starts with a pair instead of a paragraph: invalid order.
const itemWithoutLeadingParagraph: JSONContent = {
  type: 'item',
  content: [{ type: 'pair', content: [paragraph('Left'), paragraph('Right')] }],
}

const validPair: JSONContent = {
  type: 'pair',
  content: [paragraph('Left'), paragraph('Right')],
}

const validItem: JSONContent = {
  type: 'item',
  content: [paragraph('Item'), { type: 'divider' }],
}

// Ids keyed by the text of the text block, or by the type of other nodes.
function idsByLabel(doc: { descendants: Editor['state']['doc']['descendants'] }) {
  const ids: Record<string, unknown> = {}
  doc.descendants(node => {
    if (!TYPES.includes(node.type.name)) {
      return
    }
    const label = node.isTextblock ? node.textContent : node.type.name
    ids[label] = node.attrs[ATTR]
  })
  return ids
}

function idsByLabelInJSON(json: JSONContent) {
  const ids: Record<string, unknown> = {}
  const visit = (node: JSONContent) => {
    if (node.type && TYPES.includes(node.type)) {
      const label =
        node.type === 'paragraph'
          ? (node.content ?? []).map(child => child.text ?? '').join('')
          : node.type
      ids[label] = node.attrs?.[ATTR]
    }
    ;(node.content ?? []).forEach(visit)
  }
  visit(json)
  return ids
}

function textEnd(editor: Editor, text: string) {
  let end = -1
  editor.state.doc.descendants((node, pos) => {
    if (end < 0 && node.isText && node.text === text) {
      end = pos + text.length
    }
  })
  return end
}

function typeAfter(editor: Editor, text: string, typed: string) {
  editor.view.dispatch(editor.state.tr.insertText(typed, textEnd(editor, text)))
}

describe('UniqueID with content that breaks the schema', () => {
  let editor: Editor | undefined

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    editor?.destroy()
    editor = undefined
    vi.useRealTimers()
  })

  describe('on load', () => {
    it('does not throw for a node with too few children', () => {
      editor = createEditor([paragraph('Before'), pairWithOneParagraph])

      expect(() => vi.runAllTimers()).not.toThrow()

      const ids = idsByLabel(editor.state.doc)
      expect(ids.Before).toEqual(expect.any(String))
      // The invalid node and the node inside it can't change attributes.
      expect(ids.pair).toBeNull()
      expect(ids.Lonely).toBeNull()
    })

    it('does not throw for a node with children in the wrong order', () => {
      editor = createEditor([paragraph('Before'), itemWithoutLeadingParagraph])

      expect(() => vi.runAllTimers()).not.toThrow()

      const ids = idsByLabel(editor.state.doc)
      expect(ids.Before).toEqual(expect.any(String))
      expect(ids.item).toBeNull()
      // The pair's own content is valid, but its parent's isn't.
      expect(ids.pair).toBeNull()
      // A grandchild only needs its own parent to be valid.
      expect(ids.Left).toEqual(expect.any(String))
      expect(ids.Right).toEqual(expect.any(String))
    })

    it('still gives an id to every node of valid content', () => {
      editor = createEditor([paragraph('Before'), validPair, validItem])

      vi.runAllTimers()

      const ids = Object.values(idsByLabel(editor.state.doc))
      expect(ids).toHaveLength(7)
      expect(ids.every(id => typeof id === 'string')).toBe(true)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('while editing', () => {
    it('keeps typing inside a node with too few children', () => {
      editor = createEditor([paragraph('Before'), pairWithOneParagraph])
      vi.runAllTimers()

      expect(() => typeAfter(editor!, 'Lonely', '!')).not.toThrow()
      expect(editor.state.doc.textContent).toBe('BeforeLonely!')
    })

    it('keeps typing next to a node with children in the wrong order', () => {
      editor = createEditor([paragraph('Before'), itemWithoutLeadingParagraph])
      vi.runAllTimers()

      expect(() => typeAfter(editor!, 'Left', '!')).not.toThrow()
      expect(editor.state.doc.textContent).toBe('BeforeLeft!Right')
    })

    it('gives an id to a new node added next to an invalid one', () => {
      editor = createEditor([paragraph('Before'), pairWithOneParagraph])
      vi.runAllTimers()

      const end = editor.state.doc.content.size
      const newParagraph = editor.schema.nodes.paragraph.create(null, editor.schema.text('New'))
      editor.view.dispatch(editor.state.tr.insert(end, newParagraph))

      const ids = idsByLabel(editor.state.doc)
      expect(ids.New).toEqual(expect.any(String))
      expect(ids.pair).toBeNull()
    })

    it('still gives ids to a valid node inserted while editing', () => {
      editor = createEditor([paragraph('Before')])
      vi.runAllTimers()

      editor.commands.insertContentAt(editor.state.doc.content.size, validPair)

      const ids = idsByLabel(editor.state.doc)
      expect(ids.pair).toEqual(expect.any(String))
      expect(ids.Left).toEqual(expect.any(String))
      expect(ids.Right).toEqual(expect.any(String))
    })
  })

  describe('on the first collaboration sync', () => {
    function firstSync(target: Editor) {
      const { tr } = target.state
      tr.setMeta('y-sync$', true)
      tr.insertText(' ', 1)
      target.view.dispatch(tr)
    }

    it('does not throw for invalid nodes', () => {
      editor = createEditor(
        [paragraph('Before'), pairWithOneParagraph, itemWithoutLeadingParagraph],
        {
          withCollaboration: true,
        },
      )
      vi.runAllTimers()

      expect(() => firstSync(editor!)).not.toThrow()

      const ids = idsByLabel(editor.state.doc)
      expect(ids[' Before']).toEqual(expect.any(String))
      expect(ids.Lonely).toBeNull()
      expect(ids.item).toBeNull()
    })

    it('still gives an id to every node of valid content', () => {
      editor = createEditor([paragraph('Before'), validPair, validItem], {
        withCollaboration: true,
      })
      vi.runAllTimers()

      firstSync(editor)

      const ids = Object.values(idsByLabel(editor.state.doc))
      expect(ids).toHaveLength(7)
      expect(ids.every(id => typeof id === 'string')).toBe(true)
    })
  })
})

describe('generateUniqueIds with content that breaks the schema', () => {
  beforeEach(() => {
    idCounter = 0
  })

  it('does not throw and skips the nodes it cannot change', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [paragraph('Before'), pairWithOneParagraph, itemWithoutLeadingParagraph],
    }

    const ids = idsByLabelInJSON(generateUniqueIds(doc, extensions()))

    expect(ids.Before).toEqual(expect.any(String))
    expect(ids.Lonely).toBeNull()
    expect(ids.item).toBeNull()
    expect(ids.Left).toEqual(expect.any(String))
  })

  it('still gives an id to every node of valid content', () => {
    const doc: JSONContent = { type: 'doc', content: [paragraph('Before'), validPair, validItem] }

    const ids = Object.values(idsByLabelInJSON(generateUniqueIds(doc, extensions())))

    expect(ids).toHaveLength(7)
    expect(ids.every(id => typeof id === 'string')).toBe(true)
  })
})
