import { assert, it } from 'vite-plus/test'
import type { Node } from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'
import { getSyncPluginState } from '../../src/lib/plugins/getSyncPluginState.js'
import * as Y from 'yjs'
import { TextSelection } from 'prosemirror-state'
import { undo, yUndoPluginKey } from '@tiptap/y-tiptap'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments as syncYDocs } from '../utils/syncDocuments.js'

const assertMappingMatchesDoc = (view: EditorView) => {
  const binding = getSyncPluginState(view.state).binding
  const check = (type: Y.XmlFragment, node: Node) => {
    assert(binding.mapping.get(type) === node, 'mapping references the current document node')
    const elements = type.toArray().filter(child => child instanceof Y.XmlElement)
    const nodes = node.content.content.filter(child => !child.isText)
    elements.forEach((child, index) => {
      assert(child instanceof Y.XmlElement)
      check(child, nodes[index])
    })
  }
  binding.type.toArray().forEach((type, index) => {
    assert(type instanceof Y.XmlElement)
    check(type, view.state.doc.child(index))
  })
}

const withSyncedViews = (
  test: (clients: {
    writerDoc: Y.Doc
    readerDoc: Y.Doc
    writer: EditorView
    reader: EditorView
  }) => void,
  withUndo = false,
) => {
  const writerDoc = new Y.Doc()
  const readerDoc = new Y.Doc()
  writerDoc.clientID = 1
  readerDoc.clientID = 2
  const writer = createTestView(writerDoc, schema, withUndo)
  const reader = createTestView(readerDoc, schema, withUndo)
  try {
    writer.dispatch(
      writer.state.tr.replaceWith(0, writer.state.doc.content.size, [
        schema.node('heading', { level: 1 }, schema.text('title')),
        schema.node('paragraph', undefined, schema.text('hello')),
        schema.node('blockquote', undefined, [
          schema.node('paragraph', undefined, schema.text('first')),
          schema.node('paragraph', undefined, schema.text('second')),
          schema.node('paragraph', undefined, schema.text('inner tail')),
        ]),
        schema.node('paragraph', undefined, schema.text('tail')),
      ]),
    )
    syncYDocs(writerDoc, readerDoc)
    test({ writerDoc, readerDoc, writer, reader })
    assert(writer.state.doc.eq(reader.state.doc), 'documents converge')
    assertMappingMatchesDoc(reader)
  } finally {
    writer.destroy()
    reader.destroy()
    writerDoc.destroy()
    readerDoc.destroy()
  }
}

it('remote typing reuses untouched nodes', () => {
  withSyncedViews(({ writerDoc, readerDoc, writer, reader }) => {
    const before = reader.state.doc
    const pos = before.child(0).nodeSize + 2
    reader.dispatch(reader.state.tr.setSelection(TextSelection.create(before, pos + 2)))
    writer.dispatch(writer.state.tr.insertText('!', pos))
    syncYDocs(writerDoc, readerDoc)
    assert(reader.state.selection.head === pos + 3, 'caret follows its character')
    assert(reader.state.doc.child(1) !== before.child(1), 'edited paragraph is rebuilt')
    for (const index of [0, 2, 3]) {
      assert(reader.state.doc.child(index) === before.child(index), 'untouched block is reused')
    }
  })
})

it('remote attributes reuse untouched nodes', () => {
  withSyncedViews(({ writerDoc, readerDoc, writer, reader }) => {
    const before = reader.state.doc
    writer.dispatch(writer.state.tr.setNodeMarkup(0, undefined, { level: 2 }))
    syncYDocs(writerDoc, readerDoc)
    assert(reader.state.doc.child(0).attrs.level === 2, 'heading level changes')
    for (const index of [1, 2, 3]) {
      assert(reader.state.doc.child(index) === before.child(index), 'untouched block is reused')
    }
  })
})

it('nested remote edit reuses sibling branches', () => {
  withSyncedViews(({ writerDoc, readerDoc, writer, reader }) => {
    const before = reader.state.doc
    const quoteStart = before.child(0).nodeSize + before.child(1).nodeSize
    writer.dispatch(writer.state.tr.insertText('!', quoteStart + 3))
    syncYDocs(writerDoc, readerDoc)
    const quote = reader.state.doc.child(2)
    assert(quote !== before.child(2), 'changed ancestor is rebuilt')
    assert(quote.child(0) !== before.child(2).child(0), 'edited nested paragraph is rebuilt')
    assert(quote.child(1) === before.child(2).child(1), 'nested sibling is reused')
    assert(reader.state.doc.child(3) === before.child(3), 'unrelated top-level block is reused')
  })
})

it('remote block move reuses untouched nodes', () => {
  withSyncedViews(({ writerDoc, readerDoc, writer, reader }) => {
    const before = reader.state.doc
    const block = writer.state.doc.child(3)
    const start = writer.state.doc.content.size - block.nodeSize
    writer.dispatch(writer.state.tr.delete(start, start + block.nodeSize).insert(0, block))
    syncYDocs(writerDoc, readerDoc)
    assert(
      reader.state.doc.child(3) === before.child(2),
      'unrelated nested branch is reused after a move',
    )
    assertMappingMatchesDoc(reader)

    const afterMove = reader.state.doc
    const quote = reader.state.doc.child(3)
    const quoteStart = reader.state.doc.content.size - quote.nodeSize
    reader.dispatch(
      reader.state.tr.delete(quoteStart, quoteStart + quote.nodeSize).insert(0, quote),
    )
    syncYDocs(readerDoc, writerDoc)
    writer.dispatch(writer.state.tr.insertText('!', writer.state.doc.content.size - 1))
    syncYDocs(writerDoc, readerDoc)
    assert(
      reader.state.doc.child(2) === afterMove.child(1),
      'untouched heading is reused after a local move',
    )
  })
})

it('nested remote move reuses sibling branches', () => {
  withSyncedViews(({ writerDoc, readerDoc, writer, reader }) => {
    const before = reader.state.doc
    const quoteStart = before.child(0).nodeSize + before.child(1).nodeSize
    const block = writer.state.doc.child(2).child(1)
    const start = quoteStart + 1 + before.child(2).child(0).nodeSize
    const caret = before.content.size - 2
    reader.dispatch(reader.state.tr.setSelection(TextSelection.create(before, caret)))
    writer.dispatch(
      writer.state.tr.delete(start, start + block.nodeSize).insert(quoteStart + 1, block),
    )
    syncYDocs(writerDoc, readerDoc)
    assert(
      reader.state.doc.child(2).child(2) === before.child(2).child(2),
      'unmoved nested sibling is reused',
    )
    assert(reader.state.doc.child(3) === before.child(3), 'unrelated top-level sibling is reused')
    assert(reader.state.selection.head === caret, 'caret outside the move stays in place')
  })
})

it('locally reordered overlapping marks are rebuilt', () => {
  withSyncedViews(({ writerDoc, readerDoc, writer, reader }) => {
    const start = writer.state.doc.child(0).nodeSize + 1
    const first = schema.mark('comment', { id: 1 })
    const second = schema.mark('comment', { id: 2 })
    writer.dispatch(
      writer.state.tr.addMark(start, start + 5, first).addMark(start, start + 5, second),
    )
    syncYDocs(writerDoc, readerDoc)
    const untouched = reader.state.doc.child(2)
    reader.dispatch(
      reader.state.tr.removeMark(start, start + 5, first).addMark(start, start + 5, first),
    )
    assert.deepEqual(
      reader.state.doc
        .child(1)
        .child(0)
        .marks.map(mark => mark.attrs.id),
      [2, 1],
    )
    assert.deepEqual(
      writer.state.doc
        .child(1)
        .child(0)
        .marks.map(mark => mark.attrs.id),
      [1, 2],
    )

    writer.dispatch(writer.state.tr.insertText('!', writer.state.doc.content.size - 1))
    syncYDocs(writerDoc, readerDoc)
    assert.deepEqual(
      reader.state.doc
        .child(1)
        .child(0)
        .marks.map(mark => mark.attrs.id),
      [1, 2],
    )
    assert(reader.state.doc.child(2) === untouched, 'mark-order repair reuses unrelated branches')
  })
})

it('remote undo reuses untouched nodes', () => {
  withSyncedViews(({ writerDoc, readerDoc, writer, reader }) => {
    const undoState = yUndoPluginKey.getState(writer.state)
    assert(undoState)
    undoState.undoManager.stopCapturing()
    const before = reader.state.doc
    writer.dispatch(writer.state.tr.insertText('!', before.child(0).nodeSize + 2))
    syncYDocs(writerDoc, readerDoc)
    undo(writer.state)
    syncYDocs(writerDoc, readerDoc)
    assert(reader.state.doc.eq(before), 'undo restores the original content')
    assert(reader.state.doc.child(2) === before.child(2), 'undo reuses unrelated branches')
  }, true)
})

it('concurrent overlapping marks with cached nodes', () => {
  withSyncedViews(({ writerDoc, readerDoc, writer, reader }) => {
    const start = writer.state.doc.child(0).nodeSize + 1
    writer.dispatch(writer.state.tr.addMark(start, start + 5, schema.mark('comment', { id: 1 })))
    reader.dispatch(reader.state.tr.addMark(start, start + 5, schema.mark('comment', { id: 2 })))
    writer.dispatch(writer.state.tr.insertText('!', writer.state.doc.content.size - 1))
    reader.dispatch(reader.state.tr.insertText('?', 2))
    syncYDocs(writerDoc, readerDoc)
    assert(
      reader.state.doc.child(1).child(0).marks.length === 2,
      'both concurrent comments survive',
    )
    assertMappingMatchesDoc(writer)
  })
})
