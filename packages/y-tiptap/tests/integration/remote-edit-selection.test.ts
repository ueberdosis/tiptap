import { assert, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { Schema } from 'prosemirror-model'
import { TextSelection } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments as syncYDocs } from '../utils/syncDocuments.js'

// Paragraphs carry a unique id, as with UniqueID-style extensions.
const idSchema = new Schema({
  nodes: schema.spec.nodes.update('paragraph', {
    ...schema.spec.nodes.get('paragraph'),
    attrs: { id: { default: null } },
  }),
  marks: schema.spec.marks,
})

const paragraph = (id: string, text: string) =>
  idSchema.node('paragraph', { id }, text ? idSchema.text(text) : undefined)

const withTwoWriters = (run: (a: EditorView, b: EditorView, sync: () => void) => void) => {
  const docA = new Y.Doc()
  const docB = new Y.Doc()
  // Yjs orders two inserts at the same spot by client id
  docA.clientID = 1
  docB.clientID = 2
  const a = createTestView(docA, idSchema)
  const b = createTestView(docB, idSchema)
  try {
    run(a, b, () => syncYDocs(docA, docB))
  } finally {
    a.destroy()
    b.destroy()
    docA.destroy()
    docB.destroy()
  }
}

const typeAt = (view: EditorView, text: string) => {
  for (const ch of text) {
    view.dispatch(view.state.tr.insertText(ch))
  }
}

it('remote text before the cursor in the same paragraph does not move the cursor', () => {
  withTwoWriters((a, b, sync) => {
    a.dispatch(a.state.tr.replaceWith(0, a.state.doc.content.size, paragraph('p1', 'abc')))
    sync()
    a.dispatch(a.state.tr.setSelection(TextSelection.create(a.state.doc, 4)))
    b.dispatch(b.state.tr.insertText('X', 1))
    sync()
    assert.strictEqual(a.state.doc.textContent, 'Xabc')
    assert.strictEqual(a.state.selection.head, 5, 'cursor stays after "c"')
    typeAt(a, 'd')
    sync()
    assert.strictEqual(b.state.doc.textContent, 'Xabcd')
  })
})

it('two writers typing in one paragraph each keep their own text in one piece', () => {
  withTwoWriters((a, b, sync) => {
    a.dispatch(a.state.tr.replaceWith(0, a.state.doc.content.size, paragraph('p1', 'Hello ')))
    sync()
    a.dispatch(a.state.tr.setSelection(TextSelection.atEnd(a.state.doc)))
    b.dispatch(b.state.tr.setSelection(TextSelection.create(b.state.doc, 1)))
    const textA = 'world and more'
    const textB = 'Start: '
    for (let i = 0; i < Math.max(textA.length, textB.length); i++) {
      if (i < textA.length) typeAt(a, textA[i])
      if (i < textB.length) typeAt(b, textB[i])
      sync()
    }
    assert.strictEqual(a.state.doc.textContent, 'Start: Hello world and more')
    assert(a.state.doc.eq(b.state.doc), 'documents converge')
  })
})

it('two writers typing at the same spot each keep the cursor after their own letter', () => {
  withTwoWriters((a, b, sync) => {
    a.dispatch(a.state.tr.replaceWith(0, a.state.doc.content.size, paragraph('p1', 'Hello ')))
    sync()
    a.dispatch(a.state.tr.setSelection(TextSelection.atEnd(a.state.doc)))
    b.dispatch(b.state.tr.setSelection(TextSelection.atEnd(b.state.doc)))
    typeAt(a, 'h')
    typeAt(b, 'h')
    sync()
    // Client 1's "h" comes first, so B's own "h" is the second one
    assert.strictEqual(b.state.selection.head, 9)
    typeAt(b, 'ello')
    sync()
    assert.strictEqual(a.state.doc.textContent, 'Hello hhello')
  })
})

it('cursor follows its paragraph when a remote edit moves it', () => {
  withTwoWriters((a, b, sync) => {
    a.dispatch(
      a.state.tr.replaceWith(0, a.state.doc.content.size, [
        paragraph('p1', 'Alpha one.'),
        paragraph('p2', 'Gamma three.'),
      ]),
    )
    sync()
    const first = a.state.doc.child(0).nodeSize
    a.dispatch(a.state.tr.setSelection(TextSelection.create(a.state.doc, first + 1 + 3)))
    const moved = b.state.doc.child(1)
    b.dispatch(b.state.tr.delete(first, first + moved.nodeSize).insert(0, moved))
    sync()
    assert.strictEqual(a.state.doc.child(0).textContent, 'Gamma three.')
    const { $head } = a.state.selection
    assert.strictEqual($head.index(0), 0, 'cursor is in the moved paragraph')
    assert.strictEqual($head.parentOffset, 3, 'cursor keeps its paragraph offset')
  })
})
