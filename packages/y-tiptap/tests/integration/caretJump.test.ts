import { assert, it } from 'vite-plus/test'
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness'
import { TextSelection } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import * as Y from 'yjs'
import * as promise from 'lib0/promise'
import { absolutePositionToRelativePosition } from '@tiptap/y-tiptap'
import { getSyncPluginState } from '../../src/lib/plugins/getSyncPluginState.js'
import { getDOMObserver } from '../../src/lib/utils/view/domObserver.js'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments } from '../utils/syncDocuments.js'

// Two paragraphs: "abcdefghij" in the first, "klmnopqrst" in the second.
// Caret 3 sits after "ab", caret 22 after "klmnopqrs".
const fillDoc = (view: EditorView) => {
  view.dispatch(
    view.state.tr.insert(0, [
      schema.node('paragraph', undefined, schema.text('abcdefghij')),
      schema.node('paragraph', undefined, schema.text('klmnopqrst')),
    ]),
  )
}

// Moves only the DOM caret, as an arrow key does: ProseMirror reads the move
// from the selectionchange event, which has not fired yet. happy-dom fires
// that event synchronously, so pause the observer to model the window.
const moveDomCaret = (view: EditorView, position: number) => {
  const observer = getDOMObserver(view)
  // Process ProseMirror's own pending DOM writes first, so the move is the
  // only unread change when the remote update arrives.
  observer.flush()
  observer.stop()
  const { node, offset } = view.domAtPos(position)
  view.dom.ownerDocument.getSelection()?.collapse(node, offset)
  return observer
}

it('keeps a keyboard-moved caret when a remote update arrives before selectionchange', () => {
  const docA = new Y.Doc()
  const docB = new Y.Doc()
  const viewA = createTestView(docA)
  const viewB = createTestView(docB)
  // The fix only trusts a DOM selection in a focused editor.
  viewA.hasFocus = () => true

  try {
    fillDoc(viewA)
    syncDocuments(docA, docB)
    viewA.dispatch(viewA.state.tr.setSelection(TextSelection.create(viewA.state.doc, 3)))
    assert.equal(viewA.state.selection.head, 3)

    const observer = moveDomCaret(viewA, 22)
    assert.equal(viewA.state.selection.head, 3, 'state is still stale before the remote update')

    viewB.dispatch(viewB.state.tr.insertText('XY', 1))
    Y.applyUpdate(docA, Y.encodeStateAsUpdate(docB))
    observer.start()

    assert(viewA.state.doc.eq(viewB.state.doc), 'documents converge')
    assert.equal(
      viewA.state.selection.head,
      24,
      'caret stays at the DOM-moved position, mapped past the remote insert',
    )
  } finally {
    viewA.destroy()
    viewB.destroy()
    docA.destroy()
    docB.destroy()
  }
})

it('keeps a keyboard-moved caret when a remote cursor arrives before selectionchange', async () => {
  const docA = new Y.Doc()
  const docB = new Y.Doc()
  const awarenessA = new Awareness(docA)
  const awarenessB = new Awareness(docB)
  const viewA = createTestView(docA, schema, false, awarenessA)
  const viewB = createTestView(docB, schema, false, awarenessB)
  viewA.hasFocus = () => true
  // The cursor plugin flushes the DOM selection through domSelectionRange,
  // which only sees a selection in a connected DOM.
  document.body.appendChild(viewA.dom)

  try {
    fillDoc(viewA)
    syncDocuments(docA, docB)
    viewA.dispatch(viewA.state.tr.setSelection(TextSelection.create(viewA.state.doc, 3)))

    const observer = moveDomCaret(viewA, 22)
    assert.equal(viewA.state.selection.head, 3, 'state is still stale before the remote cursor')

    const bindingB = getSyncPluginState(viewB.state).binding
    const cursor = absolutePositionToRelativePosition(1, bindingB.type, bindingB.mapping)
    awarenessB.setLocalState({
      cursor: { anchor: cursor, head: cursor },
      user: { name: 'B', color: '#00ff00' },
    })
    applyAwarenessUpdate(awarenessA, encodeAwarenessUpdate(awarenessB, [docB.clientID]), 'test')
    observer.start()
    // The cursor update is dispatched on a timeout.
    await promise.wait(10)

    assert.equal(viewA.state.selection.head, 22, 'caret stays at the DOM-moved position')
  } finally {
    viewA.dom.remove()
    viewA.destroy()
    viewB.destroy()
    awarenessA.destroy()
    awarenessB.destroy()
    docA.destroy()
    docB.destroy()
  }
})
