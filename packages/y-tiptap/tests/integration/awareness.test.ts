import { assert, it } from 'vite-plus/test'
import { getSyncPluginState } from '../../src/lib/plugins/getSyncPluginState.js'
import * as Y from 'yjs'
import * as promise from 'lib0/promise'
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness'
import { EditorState, TextSelection } from 'prosemirror-state'
import type { Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { absolutePositionToRelativePosition, yCursorPlugin, ySyncPlugin } from '@tiptap/y-tiptap'
import type { CursorPluginOptions } from '../../src/types/CursorPluginOptions.js'
import { yCursorPluginKey } from '../../src/lib/plugins/keys.js'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments as syncYDocs } from '../utils/syncDocuments.js'

it('unchanged cursor not published after remote edits', async () => {
  const writerDoc = new Y.Doc()
  const readerDoc = new Y.Doc()
  const awareness = new Awareness(readerDoc)
  const writer = createTestView(writerDoc)
  const reader = createTestView(readerDoc, schema, false, awareness)

  try {
    writer.dispatch(
      writer.state.tr.insert(0, [
        schema.node('paragraph', undefined, schema.text('hello')),
        schema.node('paragraph', undefined, schema.text('other block')),
      ]),
    )
    syncYDocs(writerDoc, readerDoc)
    // Publishing requires focus, which happy-dom does not provide.
    reader.hasFocus = () => true
    reader.dispatch(reader.state.tr.setSelection(TextSelection.create(reader.state.doc, 3)))
    await promise.wait(10)

    const localState = awareness.getLocalState()
    assert(localState)
    const cursor = localState.cursor
    let updates = 0
    awareness.on('update', ({ updated }: { updated: number[] }) => {
      if (updated.includes(readerDoc.clientID)) updates++
    })

    writer.dispatch(writer.state.tr.insertText('!', writer.state.doc.content.size - 1))
    Y.applyUpdate(readerDoc, Y.encodeStateAsUpdate(writerDoc))
    assert(Y.compareRelativePositions(cursor.head, awareness.getLocalState()?.cursor.head))
    assert.equal(updates, 0, 'remote typing must not publish an unchanged cursor')

    writer.dispatch(
      writer.state.tr.insert(0, schema.node('paragraph', undefined, schema.text('new block'))),
    )
    Y.applyUpdate(readerDoc, Y.encodeStateAsUpdate(writerDoc))
    assert(reader.state.doc.eq(writer.state.doc), 'documents converge')
    assert(Y.compareRelativePositions(cursor.head, awareness.getLocalState()?.cursor.head))
    assert.equal(updates, 0, 'remote block insertion must not publish an unchanged cursor')

    reader.dispatch(reader.state.tr.setSelection(TextSelection.create(reader.state.doc, 1)))
    assert.equal(updates, 1, 'moving the cursor must still publish its new position')
  } finally {
    await promise.wait(10)
    writer.destroy()
    reader.destroy()
    awareness.destroy()
    writerDoc.destroy()
    readerDoc.destroy()
  }
})

it('cursor rendering preserves awareness user', async () => {
  const readerDoc = new Y.Doc()
  const publisherDoc = new Y.Doc()
  const awareness = new Awareness(readerDoc)
  const publisher = new Awareness(publisherDoc)
  const view = createTestView(readerDoc, schema, false, awareness)

  try {
    view.dispatch(view.state.tr.insertText('hello', 1))
    const binding = getSyncPluginState(view.state).binding
    const relativePosition = absolutePositionToRelativePosition(3, binding.type, binding.mapping)
    publisher.setLocalState({
      cursor: { anchor: relativePosition, head: relativePosition },
      user: { name: null, color: null },
    })
    applyAwarenessUpdate(
      awareness,
      encodeAwarenessUpdate(publisher, [publisherDoc.clientID]),
      'test',
    )
    await promise.wait(10)

    assert.deepEqual(awareness.getStates().get(publisherDoc.clientID)?.user, {
      name: null,
      color: null,
    })
    const cursor = view.dom.querySelector('.ProseMirror-yjs-cursor')
    assert(cursor !== null, 'remote cursor renders with default user data')
    assert(
      cursor.textContent?.includes(`User: ${publisherDoc.clientID}`),
      'default name is displayed',
    )
    assert(cursor.getAttribute('style')?.includes('#ffa500'), 'default color is displayed')

    let changes = 0
    awareness.on('change', ({ updated }: { updated: number[] }) => {
      if (updated.includes(publisherDoc.clientID)) changes++
    })
    publisher.setLocalState(publisher.getLocalState())
    applyAwarenessUpdate(
      awareness,
      encodeAwarenessUpdate(publisher, [publisherDoc.clientID]),
      'test',
    )
    assert(changes === 0, 'an identical awareness state must not cause another change')
  } finally {
    await promise.wait(10)
    view.destroy()
    awareness.destroy()
    publisher.destroy()
    readerDoc.destroy()
    publisherDoc.destroy()
  }
})

const countCursorRedraws = (
  document: Y.Doc,
  awareness: Awareness,
  options?: CursorPluginOptions,
) => {
  const counter = { redraws: 0 }
  const view = new EditorView(null, {
    state: EditorState.create({
      schema,
      plugins: [
        ySyncPlugin(document.getXmlFragment('prosemirror')),
        yCursorPlugin(awareness, options),
      ],
    }),
    dispatchTransaction(this: EditorView, transaction: Transaction) {
      if (transaction.getMeta(yCursorPluginKey)?.awarenessUpdated) counter.redraws++
      this.updateState(this.state.apply(transaction))
    },
  })
  // Publishing requires focus, which happy-dom does not provide.
  view.hasFocus = () => true

  return { view, counter }
}

it('moving the local cursor does not redraw the cursors', async () => {
  const document = new Y.Doc()
  const remoteDocument = new Y.Doc()
  const awareness = new Awareness(document)
  const remote = new Awareness(remoteDocument)
  const { view, counter } = countCursorRedraws(document, awareness)

  try {
    view.dispatch(view.state.tr.insertText('hello world', 1))
    await promise.wait(10)
    counter.redraws = 0

    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 3)))
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 6)))
    await promise.wait(10)
    assert.equal(counter.redraws, 0, 'the local cursor is not drawn')

    remote.setLocalState({ user: { name: 'remote' }, cursor: null })
    applyAwarenessUpdate(
      awareness,
      encodeAwarenessUpdate(remote, [remoteDocument.clientID]),
      'test',
    )
    await promise.wait(10)
    assert.equal(counter.redraws, 1, 'a remote awareness change still redraws the cursors')
  } finally {
    view.destroy()
    awareness.destroy()
    remote.destroy()
    document.destroy()
    remoteDocument.destroy()
  }
})

it('moving the local cursor redraws when the filter shows it', async () => {
  const document = new Y.Doc()
  const awareness = new Awareness(document)
  const { view, counter } = countCursorRedraws(document, awareness, {
    awarenessStateFilter: () => true,
  })

  try {
    view.dispatch(view.state.tr.insertText('hello world', 1))
    await promise.wait(10)
    counter.redraws = 0

    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 3)))
    await promise.wait(10)
    assert.equal(counter.redraws, 1)
  } finally {
    view.destroy()
    awareness.destroy()
    document.destroy()
  }
})
