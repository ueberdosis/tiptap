import { afterEach, describe, expect, it } from 'vite-plus/test'
import {
  absolutePositionToRelativePosition,
  redo,
  relativePositionToAbsolutePosition,
  undo,
  ySyncPluginKey,
  yUndoPluginKey,
} from '@tiptap/y-tiptap'
import * as Y from 'yjs'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments } from '../utils/syncDocuments.js'

const migrationKey = '__tiptap_position_migrations:root:prosemirror'

describe('collaboration without position migrations', () => {
  const documents: Y.Doc[] = []
  const views: ReturnType<typeof createTestView>[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  const createClient = (withUndo = false) => {
    const document = new Y.Doc()
    const view = createTestView(document, schema, withUndo)
    documents.push(document)
    views.push(view)
    return { document, view }
  }

  it('does not create migration stores during repeated structural edits on two clients', () => {
    const first = createClient()
    const second = createClient()
    const paragraph = schema.node('paragraph', null, schema.text('word '.repeat(1000).trim()))
    first.view.dispatch(
      first.view.state.tr.replaceWith(0, first.view.state.doc.content.size, paragraph),
    )
    syncDocuments(first.document, second.document)
    const original = first.view.state.doc.toJSON()

    for (let round = 0; round < 50; round += 1) {
      const { view } = round % 2 === 0 ? first : second
      view.dispatch(view.state.tr.split(10))
      syncDocuments(first.document, second.document)
      view.dispatch(view.state.tr.join(view.state.doc.firstChild!.nodeSize))
      syncDocuments(first.document, second.document)
    }

    for (const client of [first, second]) {
      expect(client.view.state.doc.toJSON()).toEqual(original)
      expect(
        [...client.document.share.keys()].filter(key =>
          key.startsWith('__tiptap_position_migrations:'),
        ),
      ).toEqual([])
    }
  })

  it('does not create migration stores for markup changes, content replacement, undo or redo', () => {
    const { document, view } = createClient(true)
    view.dispatch(view.state.tr.insertText('Hello world', 1))
    const manager = yUndoPluginKey.getState(view.state)!.undoManager
    manager.stopCapturing()
    view.dispatch(view.state.tr.setNodeMarkup(0, schema.nodes.heading, { level: 2 }))
    expect(undo(view.state)).toBe(true)
    expect(view.state.doc.firstChild!.type.name).toBe('paragraph')
    expect(redo(view.state)).toBe(true)
    expect(view.state.doc.firstChild!.type.name).toBe('heading')
    view.dispatch(
      view.state.tr.replaceWith(
        0,
        view.state.doc.content.size,
        schema.node('paragraph', null, schema.text('Replacement')),
      ),
    )

    expect(view.state.doc.textContent).toBe('Replacement')
    expect(document.share.has(migrationKey)).toBe(false)
  })

  it('ignores persisted migrations after reload and leaves them unchanged during edits', () => {
    const first = createClient()
    first.view.dispatch(first.view.state.tr.insertText('Hello world', 1))
    const sync = ySyncPluginKey.getState(first.view.state)!
    const anchor = absolutePositionToRelativePosition(7, sync.type, sync.binding.mapping)
    const store = first.document.getMap(migrationKey)
    store.set('legacy', {
      version: 1,
      client: first.document.clientID,
      clock: 0,
      seen: [...Y.decodeStateVector(Y.encodeStateVector(first.document))],
      transfers: [{ source: { ...anchor.item!, length: 1 }, target: null }],
    })
    const stored = store.toJSON()
    const second = createClient(true)
    Y.applyUpdate(second.document, Y.encodeStateAsUpdate(first.document))
    const loaded = ySyncPluginKey.getState(second.view.state)!

    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    expect(
      relativePositionToAbsolutePosition(
        second.document,
        loaded.type,
        anchor,
        loaded.binding.mapping,
      ),
    ).toBe(7)
    second.view.dispatch(second.view.state.tr.split(6))
    expect(undo(second.view.state)).toBe(true)
    expect(redo(second.view.state)).toBe(true)
    syncDocuments(first.document, second.document)

    expect(second.view.state.doc.toJSON()).toEqual(first.view.state.doc.toJSON())
    expect(first.document.getMap(migrationKey).toJSON()).toEqual(stored)
    expect(second.document.getMap(migrationKey).toJSON()).toEqual(stored)
  })
})
