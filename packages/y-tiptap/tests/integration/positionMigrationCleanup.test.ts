import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import {
  prosemirrorJSONToYDoc,
  relativePositionToAbsolutePosition,
  undo,
  redo,
  ySyncPluginKey,
  yUndoPluginKey,
} from '@tiptap/y-tiptap'
import * as Y from 'yjs'
import { createTestView } from '../utils/createTestView.js'
import { schema } from '../utils/testSchema.js'
import { syncDocuments } from '../utils/syncDocuments.js'

const migrationKey = '__tiptap_position_migrations:root:prosemirror'
const content = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] }],
}

describe('legacy position migration cleanup', () => {
  const documents: Y.Doc[] = []
  const views: ReturnType<typeof createTestView>[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  const createDocument = (gc = true) => {
    const document = new Y.Doc({ gc })
    documents.push(document)
    return document
  }

  const createView = (document: Y.Doc, withUndo = false) => {
    const view = createTestView(document, schema, withUndo)
    views.push(view)
    return view
  }

  const createLegacyDocument = () => {
    const document = prosemirrorJSONToYDoc(schema, content)
    documents.push(document)
    const fragment = document.getXmlFragment('prosemirror')
    const paragraph = fragment.get(0) as Y.XmlElement
    const text = paragraph.get(0) as Y.XmlText
    const anchor = Y.createRelativePositionFromTypeIndex(text, 6)
    document.getMap(migrationKey).set('legacy', {
      version: 1,
      client: document.clientID,
      clock: 0,
      seen: [...Y.decodeStateVector(Y.encodeStateVector(document))],
      transfers: Array.from({ length: 1000 }, () => ({
        source: { ...anchor.item!, length: 1 },
        target: null,
      })),
    })
    document.getMap('annotations').set('comment', { text: 'Keep this', anchor })
    document.getArray('versions').push(['Keep this version'])
    return { document, anchor }
  }

  it.each([true, false])(
    'clears loaded migration maps without changing other data with gc=%s',
    gc => {
      const legacy = createLegacyDocument()
      legacy.document
        .getMap('__tiptap_position_migrations:root:other')
        .set('old', { transfers: [] })
      legacy.document
        .getMap('__tiptap_position_migrations:item:123:456')
        .set('old', { transfers: [] })
      const encoded = Y.encodeStateAsUpdate(legacy.document)
      const document = createDocument(gc)
      Y.applyUpdate(document, encoded)
      const annotations = document.getMap('annotations').toJSON()
      const versions = document.getArray('versions').toJSON()
      const view = createView(document, true)
      const sync = ySyncPluginKey.getState(view.state)!

      expect(document.getMap(migrationKey).size).toBe(0)
      expect(document.getMap('__tiptap_position_migrations:root:other').size).toBe(0)
      expect(document.getMap('__tiptap_position_migrations:item:123:456').size).toBe(0)
      expect(document.getMap('annotations').toJSON()).toEqual(annotations)
      expect(document.getArray('versions').toJSON()).toEqual(versions)
      expect(view.state.doc.toJSON()).toEqual(content)
      expect(
        relativePositionToAbsolutePosition(
          document,
          sync.type,
          legacy.anchor,
          sync.binding.mapping,
        ),
      ).toBe(7)
      expect(yUndoPluginKey.getState(view.state)!.undoManager.undoStack).toHaveLength(0)
      expect(document.gc).toBe(gc)
      if (gc) {
        expect(Y.encodeStateAsUpdate(document).length).toBeLessThan(encoded.length / 10)
      } else {
        expect(Y.encodeStateAsUpdate(document).length).toBeGreaterThanOrEqual(encoded.length)
      }

      view.dispatch(view.state.tr.insertText('!', 1))
      expect(undo(view.state)).toBe(true)
      expect(view.state.doc.toJSON()).toEqual(content)
      expect(redo(view.state)).toBe(true)
      expect(document.getMap(migrationKey).size).toBe(0)
    },
  )

  it('clears migrations arriving after the editor mounts and synchronizes the deletion', () => {
    const legacy = createLegacyDocument()
    const document = createDocument()
    const view = createView(document)
    syncDocuments(legacy.document, document)

    expect(view.state.doc.toJSON()).toEqual(content)
    expect(document.getMap(migrationKey).size).toBe(0)
    expect(legacy.document.getMap(migrationKey).size).toBe(0)

    legacy.document.getMap(migrationKey).set('later', { transfers: [] })
    syncDocuments(legacy.document, document)
    expect(document.getMap(migrationKey).size).toBe(0)
    expect(legacy.document.getMap(migrationKey).size).toBe(0)

    const reloaded = createDocument()
    Y.applyUpdate(reloaded, Y.encodeStateAsUpdate(document))
    expect(reloaded.getMap(migrationKey).size).toBe(0)
    expect(reloaded.getMap('annotations').toJSON()).toEqual(
      legacy.document.getMap('annotations').toJSON(),
    )
    expect(reloaded.getArray('versions').toJSON()).toEqual(['Keep this version'])
  })

  it('does not create migration maps or emit updates in a clean document', () => {
    const document = createDocument()
    const updates = vi.fn()
    document.on('update', updates)
    const view = createView(document)
    view.dispatch(view.state.tr.setMeta('refresh', true))

    expect(updates).not.toHaveBeenCalled()
    expect([...document.share.keys()]).toEqual(['prosemirror'])
  })

  it('stops cleaning after the editor is destroyed', () => {
    const document = createDocument()
    const view = createView(document)
    views.pop()
    view.destroy()
    const legacy = createLegacyDocument()
    Y.applyUpdate(document, Y.encodeStateAsUpdate(legacy.document))

    expect(document.getMap(migrationKey).size).toBe(1)
    createView(document)
    expect(document.getMap(migrationKey).size).toBe(0)
  })
})
