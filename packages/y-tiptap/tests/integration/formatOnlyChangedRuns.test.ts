import { expect, it } from 'vite-plus/test'
import type { EditorView } from 'prosemirror-view'
import { Schema } from 'prosemirror-model'
import { marks, nodes } from 'prosemirror-schema-basic'
import * as Y from 'yjs'
import { undo, yUndoPluginKey } from '@tiptap/y-tiptap'
import { createTestView } from '../utils/createTestView.js'
import { syncDocuments } from '../utils/syncDocuments.js'

// Mark with more attrs than a foreign writer stores: the shared doc holds only
// id and state, while the schema also declares note.
const checkSchema = new Schema({
  nodes,
  marks: {
    ...marks,
    check: {
      attrs: { id: { default: null }, state: { default: null }, note: { default: null } },
      toDOM: mark => ['check', { check_id: mark.attrs.id }],
    },
  },
})

const paragraphText = (document: Y.Doc) => {
  const paragraph = document.getXmlFragment('prosemirror').get(0)
  if (!(paragraph instanceof Y.XmlElement)) throw new Error('Missing paragraph')
  const text = paragraph.get(0)
  if (!(text instanceof Y.XmlText)) throw new Error('Missing paragraph text')
  return text
}

const attrsAt = (document: Y.Doc, index: number) => {
  const delta = paragraphText(document).toDelta()
  let at = 0
  for (const part of delta) {
    const length = typeof part.insert === 'string' ? part.insert.length : 1
    if (index >= at && index < at + length) return part.attributes ?? {}
    at += length
  }
  return {}
}

const checkStateAt = (document: Y.Doc, index: number) => {
  const check = attrsAt(document, index).check as { state?: unknown } | undefined
  return check?.state
}

const withCheckedViews = (
  test: (clients: {
    firstDoc: Y.Doc
    secondDoc: Y.Doc
    first: EditorView
    second: EditorView
  }) => void,
) => {
  const firstDoc = new Y.Doc()
  const secondDoc = new Y.Doc()
  const first = createTestView(firstDoc, checkSchema, true)
  const second = createTestView(secondDoc, checkSchema, true)
  try {
    // Seed "A. B." directly in the shared doc, with marks holding only the
    // attrs a foreign writer stores.
    const element = new Y.XmlElement('paragraph')
    element.insert(0, [new Y.XmlText('A. B.')])
    firstDoc.getXmlFragment('prosemirror').insert(0, [element])
    const text = paragraphText(firstDoc)
    firstDoc.transact(() => {
      text.format(0, 2, { check: { id: 'a', state: 'x' } })
      text.format(3, 2, { check: { id: 'b', state: 'x' } })
    })
    syncDocuments(firstDoc, secondDoc)
    // Both views render the seeded marks; clear undo history before the test.
    yUndoPluginKey.getState(first.state)!.undoManager.clear()
    yUndoPluginKey.getState(second.state)!.undoManager.clear()
    test({ firstDoc, secondDoc, first, second })
  } finally {
    first.destroy()
    second.destroy()
    firstDoc.destroy()
    secondDoc.destroy()
  }
}

it("typing in one run leaves the other run's stored marks untouched", () => {
  withCheckedViews(({ firstDoc, first }) => {
    expect(first.state.doc.textContent).toBe('A. B.')
    // Type inside "A." — position 2 is between "A" and ".".
    first.dispatch(first.state.tr.insertText('X', 2))
    expect(first.state.doc.textContent).toBe('AX. B.')
    // "B." keeps exactly the attrs the foreign writer stored — no rewritten copy.
    expect(attrsAt(firstDoc, 4)).toEqual({ check: { id: 'b', state: 'x' } })
  })
})

it('undoing a keystroke keeps a newer mark value set by another client', () => {
  withCheckedViews(({ firstDoc, secondDoc, first }) => {
    expect(first.state.doc.textContent).toBe('A. B.')
    expect(checkStateAt(firstDoc, 4)).toBe('x')

    // Type inside "A." — position 2 is between "A" and ".".
    first.dispatch(first.state.tr.insertText('X', 2))
    expect(first.state.doc.textContent).toBe('AX. B.')
    syncDocuments(firstDoc, secondDoc)

    // Another client sets "B."'s mark to state "y".
    secondDoc.transact(() => {
      paragraphText(secondDoc).format(4, 2, { check: { id: 'b', state: 'y' } })
    })
    syncDocuments(secondDoc, firstDoc)
    expect(checkStateAt(firstDoc, 4)).toBe('y')

    expect(undo(first.state)).toBe(true)
    expect(first.state.doc.textContent).toBe('A. B.')
    // The undo must not bring back the old value of a mark it never changed.
    expect(checkStateAt(firstDoc, 4)).toBe('y')
  })
})
