import { assert, it } from 'vite-plus/test'
import { getSyncPluginState } from '../../src/lib/plugins/getSyncPluginState.js'
import * as Y from 'yjs'
import * as promise from 'lib0/promise'
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness'
import { EditorState, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  yCursorPlugin,
  ySyncPlugin,
} from '@tiptap/y-tiptap'
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

const createFieldView = (
  doc: Y.Doc,
  field: string,
  awareness: Awareness,
  cursorStateField?: string,
) => {
  const view = new EditorView(null, {
    state: EditorState.create({
      schema,
      plugins: [
        ySyncPlugin(doc.getXmlFragment(field)),
        yCursorPlugin(awareness, {}, cursorStateField),
      ],
    }),
  })
  view.dispatch(view.state.tr.insertText(`${field} text`, 1))
  return view
}

const focus = (view: EditorView, from: number, to: number) => {
  // Publishing requires focus, which happy-dom does not provide.
  view.hasFocus = () => true
  view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to)))
}

const blur = (view: EditorView) => {
  view.hasFocus = () => false
  view.dom.dispatchEvent(new FocusEvent('focusout'))
}

it("keeps each field's latest selection and focus in the cursor's awareness update", () => {
  const doc = new Y.Doc()
  const awareness = new Awareness(doc)
  const title = createFieldView(doc, 'title', awareness)
  const body = createFieldView(doc, 'body', awareness)

  try {
    let updates = 0
    awareness.on('update', ({ updated }: { updated: number[] }) => {
      if (updated.includes(doc.clientID)) updates++
    })

    focus(title, 1, 4)
    const titleCursor = awareness.getLocalState()?.cursor
    assert.equal(updates, 1, 'a selection change publishes the cursor and entry together')
    assert.deepInclude(awareness.getLocalState()?.lastSelection.title, {
      ...titleCursor,
      focused: true,
    })

    blur(title)
    assert.equal(updates, 2, 'blur publishes the cleared cursor and entry together')
    assert.isNull(awareness.getLocalState()?.cursor)
    const titleSelection = awareness.getLocalState()?.lastSelection.title
    assert.deepInclude(titleSelection, { ...titleCursor, focused: false })
    assert.isNumber(titleSelection.time)

    focus(body, 2, 5)
    assert.equal(awareness.getLocalState()?.lastSelection.body.focused, true)
    blur(body)
    const { lastSelection } = awareness.getLocalState() ?? {}
    assert.deepEqual(lastSelection.title, titleSelection, 'other fields keep their selection')
    assert.equal(lastSelection.body.focused, false)
    assert.equal(
      relativePositionToAbsolutePosition(
        doc,
        doc.getXmlFragment('body'),
        Y.createRelativePositionFromJSON(lastSelection.body.head),
        getSyncPluginState(body.state).binding.mapping,
      ),
      5,
    )

    // Plugin views are recreated on plugin changes, so destroying one keeps the selection.
    body.destroy()
    assert.deepEqual(awareness.getLocalState()?.lastSelection, lastSelection)
  } finally {
    title.destroy()
    body.destroy()
    awareness.destroy()
    doc.destroy()
  }
})

it('keeps the last selection once for a custom cursor state field', async () => {
  const doc = new Y.Doc()
  const awareness = new Awareness(doc)
  awareness.setLocalStateField('cursor', null)
  const view = createFieldView(doc, 'title', awareness, 'titleCursor')

  try {
    focus(view, 1, 4)
    const cursor = awareness.getLocalState()?.titleCursor
    assert(cursor, 'focused editors publish the configured cursor field')
    assert.isNull(awareness.getLocalState()?.cursor, 'the default cursor field stays untouched')

    let updates = 0
    awareness.on('update', ({ updated }: { updated: number[] }) => {
      if (updated.includes(doc.clientID)) updates++
    })
    blur(view)
    await promise.wait(20)

    assert.equal(updates, 1, 'blur must not trigger further awareness updates')
    assert.isNull(awareness.getLocalState()?.titleCursor)
    assert.deepEqual(awareness.getLocalState()?.lastSelection.title.head, cursor.head)
  } finally {
    view.destroy()
    awareness.destroy()
    doc.destroy()
  }
})

it('clears the cursor on blur for awareness adapters without setLocalState', () => {
  const doc = new Y.Doc()
  const awareness = new Awareness(doc)
  const adapter = {
    clientID: awareness.clientID,
    getLocalState: () => awareness.getLocalState(),
    getStates: () => awareness.getStates(),
    setLocalStateField: (field: string, value: unknown) =>
      awareness.setLocalStateField(field, value),
    on: awareness.on.bind(awareness),
    off: awareness.off.bind(awareness),
  } as unknown as Awareness
  const view = createFieldView(doc, 'title', adapter)

  try {
    focus(view, 1, 4)
    blur(view)
    assert.isNull(awareness.getLocalState()?.cursor)
    assert.isUndefined(awareness.getLocalState()?.lastSelection)
  } finally {
    view.destroy()
    awareness.destroy()
    doc.destroy()
  }
})

it('only clears a cursor stored under the lastSelection field', async () => {
  const doc = new Y.Doc()
  const awareness = new Awareness(doc)
  const view = createFieldView(doc, 'title', awareness, 'lastSelection')

  try {
    focus(view, 1, 4)
    let updates = 0
    awareness.on('update', ({ updated }: { updated: number[] }) => {
      if (updated.includes(doc.clientID)) updates++
    })
    blur(view)
    await promise.wait(20)

    assert.equal(updates, 1)
    assert.isNull(awareness.getLocalState()?.lastSelection)
  } finally {
    view.destroy()
    awareness.destroy()
    doc.destroy()
  }
})

it('does not republish presence after the local state is disabled', () => {
  const doc = new Y.Doc()
  const awareness = new Awareness(doc)
  const view = createFieldView(doc, 'title', awareness)

  try {
    awareness.setLocalState(null)
    focus(view, 1, 4)
    blur(view)
    assert.isNull(awareness.getLocalState())
  } finally {
    view.destroy()
    awareness.destroy()
    doc.destroy()
  }
})

it('marks a field blurred after another editor cleared the shared cursor', () => {
  const doc = new Y.Doc()
  const awareness = new Awareness(doc)
  const title = createFieldView(doc, 'title', awareness)
  const body = createFieldView(doc, 'body', awareness)

  try {
    focus(title, 1, 4)
    body.destroy()
    assert.isNull(awareness.getLocalState()?.cursor, 'destroying an editor clears the cursor')

    blur(title)
    assert.equal(awareness.getLocalState()?.lastSelection.title.focused, false)
  } finally {
    title.destroy()
    body.destroy()
    awareness.destroy()
    doc.destroy()
  }
})
