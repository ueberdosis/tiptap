import { expect, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { undo, yUndoPluginKey } from '@tiptap/y-tiptap'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments } from '../utils/syncDocuments.js'

it('groups local typing into one undo step while a collaborator is typing', () => {
  const firstDocument = new Y.Doc()
  const secondDocument = new Y.Doc()
  const first = createTestView(firstDocument, schema, true)
  const second = createTestView(secondDocument, schema, true)

  try {
    first.dispatch(
      first.state.tr.replaceWith(0, first.state.doc.content.size, [
        schema.node('paragraph', null, schema.text('first')),
        schema.node('paragraph', null, schema.text('second')),
      ]),
    )
    syncDocuments(firstDocument, secondDocument)
    yUndoPluginKey.getState(first.state)!.undoManager.clear()

    for (const character of 'Hi ') {
      first.dispatch(first.state.tr.insertText(character, first.state.doc.child(0).nodeSize - 1))
      second.dispatch(second.state.tr.insertText('!', second.state.doc.content.size - 1))
      syncDocuments(firstDocument, secondDocument)
      // Like a remote caret update
      first.dispatch(first.state.tr.setMeta('caret', true))
    }

    expect(first.state.doc.textContent).toBe('firstHi second!!!')
    undo(first.state)
    expect(first.state.doc.textContent).toBe('firstsecond!!!')
  } finally {
    first.destroy()
    second.destroy()
    firstDocument.destroy()
    secondDocument.destroy()
  }
})
