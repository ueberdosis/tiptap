import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { yDocToProsemirrorJSON, ySyncPlugin } from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import * as Y from 'yjs'
import { schema } from '../utils/testSchema.js'
import { syncDocuments } from '../utils/syncDocuments.js'

describe('remote changes during IME composition', () => {
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
        plugins: [ySyncPlugin(document.getXmlFragment('prosemirror'))],
      }),
    })
    views.push(view)
    return { document, view }
  }

  const sharedText = (document: Y.Doc) =>
    schema.nodeFromJSON(yDocToProsemirrorJSON(document)).textContent

  // EditorView exposes composing as a getter, so the test shadows it per view.
  const setComposing = (view: EditorView, value: boolean) => {
    Object.defineProperty(view, 'composing', { value, configurable: true })
  }

  it('holds remote changes while composing and replays them on compositionend', async () => {
    const local = createClient()
    const remote = createClient()

    local.view.dispatch(local.view.state.tr.insertText('second paragraph', 1))
    syncDocuments(local.document, remote.document)
    expect(remote.view.state.doc.textContent).toBe('second paragraph')

    // Start an IME composition at the end of the paragraph.
    setComposing(local.view, true)
    // Remote user types at the start of the same paragraph.
    remote.view.dispatch(remote.view.state.tr.insertText('XYZ ', 1))
    syncDocuments(remote.document, local.document)

    // The remote change is held, not rendered into the composing view.
    expect(local.view.state.doc.textContent).toBe('second paragraph')

    // A local composition step must not delete the held remote text.
    local.view.dispatch(local.view.state.tr.insertText('안녕', 17))
    expect(sharedText(local.document)).toContain('XYZ ')

    // Ending the composition replays the remote change, then syncs the local text.
    setComposing(local.view, false)
    local.view.dispatch(local.view.state.tr.insertText('하세요', 19))
    await vi.waitFor(() =>
      expect(local.view.state.doc.textContent).toBe('XYZ second paragraph안녕하세요'),
    )
    expect(sharedText(local.document)).toBe('XYZ second paragraph안녕하세요')
    syncDocuments(local.document, remote.document)
    expect(remote.view.state.doc.textContent).toBe('XYZ second paragraph안녕하세요')
  })

  it('replays held remote changes after one second even if the composition never ends', async () => {
    vi.useFakeTimers()

    try {
      const local = createClient()
      const remote = createClient()

      local.view.dispatch(local.view.state.tr.insertText('second paragraph', 1))
      syncDocuments(local.document, remote.document)

      setComposing(local.view, true)
      remote.view.dispatch(remote.view.state.tr.insertText('XYZ ', 1))
      syncDocuments(remote.document, local.document)
      expect(local.view.state.doc.textContent).toBe('second paragraph')

      await vi.advanceTimersByTimeAsync(1000)
      expect(local.view.state.doc.textContent).toBe('XYZ second paragraph')
    } finally {
      vi.useRealTimers()
    }
  })
})
