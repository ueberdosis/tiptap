import { splitBlock } from 'prosemirror-commands'
import { EditorState, Plugin, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { prosemirrorToYXmlFragment, undo, ySyncPlugin, yUndoPlugin } from '@tiptap/y-tiptap'
import { expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { createTestView } from '../utils/createTestView.js'
import { syncDocuments } from '../utils/syncDocuments.js'
import { schema } from '../utils/testSchema.js'

const splitWithPlugin = (view: EditorView) =>
  expect(
    splitBlock(view.state, transaction => view.dispatch(transaction.setMeta('split', true))),
  ).toBe(true)

it.each([
  {
    name: 'pressing Enter',
    edit: (view: EditorView) => expect(splitBlock(view.state, view.dispatch)).toBe(true),
    expected: ['', 't!arget'],
  },
  {
    name: 'pressing Enter in a blockquote',
    insideQuote: true,
    edit: (view: EditorView) => expect(splitBlock(view.state, view.dispatch)).toBe(true),
    expected: ['', 't!arget'],
  },
  {
    name: 'pasting two paragraphs',
    edit: (view: EditorView) => expect(view.pasteHTML('<p>First</p><p>Prefix: </p>')).toBe(true),
    expected: ['First', 'Prefix:t!arget'],
  },
  {
    name: 'pasting a heading and a paragraph',
    edit: (view: EditorView) =>
      expect(view.pasteHTML('<h2>Heading</h2><p>target: </p>')).toBe(true),
    expected: ['Heading', 'target:t!arget'],
  },
  {
    name: 'pasting a blockquote before the original paragraph',
    edit: (view: EditorView) =>
      expect(view.pasteHTML('<blockquote><p>Quote</p></blockquote><p>Prefix: </p>')).toBe(true),
    expected: ['Quote', 'Prefix:t!arget'],
  },
  {
    name: 'pressing Enter when a plugin fills the new paragraph',
    edit: splitWithPlugin,
    append: (state: EditorState) => state.tr.insertText('target', state.doc.child(0).nodeSize + 1),
    expected: ['target', 't!arget'],
  },
  {
    name: 'pressing Enter when a plugin inserts a heading before the first paragraph',
    edit: splitWithPlugin,
    append: (state: EditorState) =>
      state.tr.insert(0, schema.node('heading', null, schema.text('Title'))),
    expected: ['', 't!arget'],
    leading: ['Title'],
  },
  {
    name: 'splitting and filling the new paragraph in one transaction',
    edit: (view: EditorView) => {
      const start = view.state.selection.from
      view.dispatch(view.state.tr.split(start).insertText('target', start))
    },
    expected: ['target', 't!arget'],
  },
  {
    name: 'splitting after another step inserts a heading',
    edit: (view: EditorView) => {
      const transaction = view.state.tr.insert(
        0,
        schema.node('heading', null, schema.text('Title')),
      )
      view.dispatch(transaction.split(transaction.selection.from))
    },
    expected: ['', 't!arget'],
    leading: ['Title'],
  },
  {
    name: 'splitting in an appended transaction',
    edit: (view: EditorView) =>
      view.dispatch(
        view.state.tr
          .insert(0, schema.node('heading', null, schema.text('Title')))
          .setMeta('split', true),
      ),
    append: (state: EditorState) => {
      const start = state.selection.from
      return state.tr.split(start).insertText('target', start)
    },
    expected: ['target', 't!arget'],
    leading: ['Title'],
  },
])('keeps typing in the original paragraph after $name at its start', scenario => {
  const { append, edit, expected, insideQuote, leading = [] } = scenario
  const firstDoc = new Y.Doc()
  const secondDoc = new Y.Doc()
  const fragment = firstDoc.getXmlFragment('prosemirror')
  const paragraph = (text: string) => schema.node('paragraph', null, schema.text(text))
  const documentWithTarget = (text: string) =>
    schema.node('doc', null, [
      paragraph('Before'),
      insideQuote ? schema.node('blockquote', null, paragraph(text)) : paragraph(text),
      paragraph('After'),
      paragraph('Last'),
    ])
  const original = documentWithTarget('target')
  prosemirrorToYXmlFragment(original, fragment)
  syncDocuments(firstDoc, secondDoc)
  const plugin = new Plugin({
    appendTransaction: (transactions, _, state) =>
      transactions.some(transaction => transaction.getMeta('split')) ? append?.(state) : null,
  })
  const first = new EditorView(null, {
    state: EditorState.create({ schema, plugins: [ySyncPlugin(fragment), yUndoPlugin(), plugin] }),
  })
  const second = createTestView(secondDoc)
  const parent = insideQuote ? (fragment.get(1) as Y.XmlElement) : fragment
  const index = insideQuote ? 0 : 1
  const target = parent.get(index)
  const position = original.child(0).nodeSize + (insideQuote ? 2 : 1)

  try {
    first.dispatch(first.state.tr.setSelection(TextSelection.create(first.state.doc, position)))
    edit(first)
    second.dispatch(second.state.tr.insertText('!', position + 1))
    syncDocuments(firstDoc, secondDoc)

    for (const view of [first, second]) {
      const paragraphs: string[] = []
      const result = insideQuote ? view.state.doc.child(1) : view.state.doc
      result.forEach(node => paragraphs.push(node.textContent))
      expect(paragraphs).toEqual(
        insideQuote ? expected : [...leading, 'Before', ...expected, 'After', 'Last'],
      )
    }
    expect(parent.get(index + 1 + leading.length)).toBe(target)

    expect(undo(first.state)).toBe(true)
    syncDocuments(firstDoc, secondDoc)
    const afterUndo = documentWithTarget('t!arget')
    expect(first.state.doc.toJSON()).toEqual(afterUndo.toJSON())
    expect(second.state.doc.toJSON()).toEqual(afterUndo.toJSON())
  } finally {
    first.destroy()
    second.destroy()
    firstDoc.destroy()
    secondDoc.destroy()
  }
})

it('applies local insertions when a pending Yjs deletion changes the parent length', () => {
  const document = new Y.Doc()
  const fragment = document.getXmlFragment('prosemirror')
  const paragraphs = ['Before', 'target', 'After', 'Last'].map(text =>
    schema.node('paragraph', null, schema.text(text)),
  )
  prosemirrorToYXmlFragment(schema.node('doc', null, paragraphs), fragment)
  const view = createTestView(document)
  const heading = schema.node('heading', null, schema.text('Title'))

  try {
    document.transact(() => {
      fragment.delete(3, 1)
      const transaction = view.state.tr.split(paragraphs[0].nodeSize + 1)
      view.dispatch(transaction.insert(transaction.doc.content.size, heading))
    })

    expect(view.state.doc.child(1).textContent).toBe('')
    expect(view.state.doc.child(2).textContent).toBe('target')
    expect(view.state.doc.lastChild?.eq(heading)).toBe(true)
  } finally {
    view.destroy()
    document.destroy()
  }
})
