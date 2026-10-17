import { assert, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { TextSelection } from 'prosemirror-state'
import { findAbsolutePositionAfterStructuralChange } from '@tiptap/y-tiptap'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments as syncYDocs } from '../utils/syncDocuments.js'

const withNestedMove = (nested: boolean, selectedIndex: number, offset: number) => {
  const writerDoc = new Y.Doc()
  const readerDoc = new Y.Doc()
  const writer = createTestView(writerDoc)
  const reader = createTestView(readerDoc)
  try {
    const paragraphs = ['First nested paragraph', 'Second nested paragraph'].map(text =>
      schema.node('paragraph', undefined, schema.text(text)),
    )
    const inner = schema.node('blockquote', undefined, paragraphs)
    writer.dispatch(
      writer.state.tr.replaceWith(0, writer.state.doc.content.size, [
        schema.node('paragraph', undefined, schema.text('Before')),
        nested ? schema.node('blockquote', undefined, inner) : inner,
        schema.node('paragraph', undefined, schema.text('After')),
      ]),
    )
    syncYDocs(writerDoc, readerDoc)
    const innerStart = reader.state.doc.child(0).nodeSize + (nested ? 2 : 1)
    const selectedStart = innerStart + selectedIndex * paragraphs[0].nodeSize
    reader.dispatch(
      reader.state.tr.setSelection(
        TextSelection.create(reader.state.doc, selectedStart + 1 + offset),
      ),
    )
    writer.dispatch(writer.state.tr.insertText('Z', innerStart + 2))
    syncYDocs(writerDoc, readerDoc)
    const before = reader.state.selection.$head
    const quote = nested ? writer.state.doc.child(1).child(0) : writer.state.doc.child(1)
    const moved = quote.child(1)
    const moveStart = innerStart + quote.child(0).nodeSize
    writer.dispatch(
      writer.state.tr.delete(moveStart, moveStart + moved.nodeSize).insert(innerStart, moved),
    )
    syncYDocs(writerDoc, readerDoc)
    assert(reader.state.doc.eq(writer.state.doc), 'documents converge after the nested move')
    assert(
      reader.state.selection.$head.parent.textContent === before.parent.textContent,
      'cursor stays in the same nested paragraph',
    )
    assert(
      reader.state.selection.$head.parentOffset === before.parentOffset,
      'cursor keeps its paragraph offset',
    )
  } finally {
    writer.destroy()
    reader.destroy()
    writerDoc.destroy()
    readerDoc.destroy()
  }
}

it('cursor follows moved nested paragraph', () => {
  withNestedMove(false, 1, 3)
})

it('cursor stays in nested sibling after move', () => {
  withNestedMove(false, 0, 3)
})

it('cursor follows deeply nested paragraph', () => {
  withNestedMove(true, 1, 3)
})

it('cursor at nested paragraph start follows move', () => {
  withNestedMove(false, 1, 0)
})

it('deleted nested paragraph does not match sibling index', () => {
  const paragraphs = ['First', 'Second', 'Third'].map(text =>
    schema.node('paragraph', undefined, schema.text(text)),
  )
  const oldDoc = schema.node('doc', undefined, schema.node('blockquote', undefined, paragraphs))
  const newDoc = schema.node(
    'doc',
    undefined,
    schema.node('blockquote', undefined, [paragraphs[0], paragraphs[2]]),
  )
  assert(
    findAbsolutePositionAfterStructuralChange(oldDoc, newDoc, paragraphs[0].nodeSize + 4) === null,
    'a deleted nested paragraph does not match its replacement sibling',
  )
})
