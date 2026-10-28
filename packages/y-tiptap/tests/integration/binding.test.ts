import { Schema } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import {
  prosemirrorJSONToYDoc,
  redo,
  undo,
  yDocToProsemirrorJSON,
  ySyncPlugin,
  ySyncPluginKey,
  yUndoPlugin,
  yUndoPluginKey,
} from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import * as Y from 'yjs'

const schema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: {
      content: 'text*',
      toDOM: () => ['p', 0],
    },
    text: {},
  },
  marks: {
    bold: { toDOM: () => ['strong', 0] },
  },
})

describe('Yjs binding', () => {
  const documents: Y.Doc[] = []
  const views: EditorView[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  const createClient = () => {
    const document = new Y.Doc({ gc: false })
    documents.push(document)
    const view = new EditorView(null, {
      state: EditorState.create({
        schema,
        plugins: [ySyncPlugin(document.getXmlFragment('prosemirror')), yUndoPlugin()],
      }),
    })
    views.push(view)
    return { document, view }
  }

  it('keeps an untouched empty editor out of the shared document', () => {
    const client = createClient()
    const updates: Uint8Array[] = []
    client.document.on('update', update => updates.push(update))
    client.view.dispatch(client.view.state.tr.setMeta('refresh', true))

    expect(updates).toHaveLength(0)
    expect(client.document.getXmlFragment('prosemirror').length).toBe(0)
  })

  it.each(['snapshot', 'update'] as const)('renders and restores a historical %s', async format => {
    const client = createClient()
    client.view.dispatch(client.view.state.tr.insertText('Hello', 1))
    const history =
      format === 'snapshot' ? Y.snapshot(client.document) : Y.encodeStateAsUpdateV2(client.document)
    client.view.dispatch(client.view.state.tr.insertText('Hi', 1, 6))
    const syncState = ySyncPluginKey.getState(client.view.state)
    if (!syncState) throw new Error('Missing sync plugin state')

    syncState.binding.renderSnapshot(history, history)
    await vi.waitFor(() => expect(client.view.state.doc.textContent).toBe('Hello'))
    expect(yDocToProsemirrorJSON(client.document)).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }],
    })
    syncState.binding.unrenderSnapshot()
    expect(client.view.state.doc.textContent).toBe('Hi')
  })

  it.each(['snapshot', 'update'] as const)(
    'writes a restored historical %s to the shared document',
    async format => {
      const client = createClient()
      client.view.dispatch(client.view.state.tr.insertText('Hello', 1))
      const history =
        format === 'snapshot'
          ? Y.snapshot(client.document)
          : Y.encodeStateAsUpdateV2(client.document)
      client.view.dispatch(client.view.state.tr.insertText('Hi', 1, 6))

      client.view.dispatch(
        client.view.state.tr.setMeta(ySyncPluginKey, {
          snapshot: history,
          prevSnapshot: history,
          restore: true,
        }),
      )

      await vi.waitFor(() =>
        expect(yDocToProsemirrorJSON(client.document)).toEqual({
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
        }),
      )
      expect(client.view.state.doc.textContent).toBe('Hello')
    },
  )

  it('preserves document structure and marks through conversion', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello', marks: [{ type: 'bold' }] }],
        },
      ],
    }
    const document = prosemirrorJSONToYDoc(schema, content)
    documents.push(document)

    expect(yDocToProsemirrorJSON(document)).toEqual(content)
  })

  it('converges after concurrent edits and repeated updates', () => {
    const first = createClient()
    first.view.dispatch(first.view.state.tr.insertText('Hello', 1))
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))

    first.view.dispatch(first.view.state.tr.insertText(' Alice', 6))
    second.view.dispatch(second.view.state.tr.insertText(' Bob', 6))
    const firstUpdate = Y.encodeStateAsUpdate(first.document)
    const secondUpdate = Y.encodeStateAsUpdate(second.document)
    Y.applyUpdate(first.document, secondUpdate)
    Y.applyUpdate(second.document, firstUpdate)
    Y.applyUpdate(first.document, secondUpdate)
    Y.applyUpdate(second.document, firstUpdate)

    expect(first.view.state.doc.toJSON()).toEqual(second.view.state.doc.toJSON())
    expect(first.view.state.doc.textContent).toContain('Alice')
    expect(first.view.state.doc.textContent).toContain('Bob')
    expect(yDocToProsemirrorJSON(first.document)).toEqual(first.view.state.doc.toJSON())
  })

  it('undoes and redoes local edits while preserving remote edits', () => {
    const first = createClient()
    first.view.dispatch(first.view.state.tr.insertText('Hello', 1))
    const second = createClient()
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    second.view.dispatch(second.view.state.tr.insertText(' Bob', 6))
    Y.applyUpdate(first.document, Y.encodeStateAsUpdate(second.document))

    const undoState = yUndoPluginKey.getState(first.view.state)
    if (!undoState) throw new Error('Missing undo plugin state')
    undoState.undoManager.stopCapturing()
    first.view.dispatch(first.view.state.tr.insertText(' Alice', 10))
    expect(undo(first.view.state)).toBe(true)
    expect(first.view.state.doc.textContent).toBe('Hello Bob')
    expect(redo(first.view.state)).toBe(true)
    expect(first.view.state.doc.textContent).toBe('Hello Bob Alice')

    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
  })
})
