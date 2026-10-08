import { Editor } from '@tiptap/core'
import { Collaboration } from '@tiptap/extension-collaboration'
import StarterKit from '@tiptap/starter-kit'
import { relativePositionToAbsolutePosition, ySyncPluginKey } from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import * as Y from 'yjs'

import { AiSelectionAwareness } from './selection-awareness.js'
import { ServerAiToolkit } from './server-ai-toolkit-extension.js'

function createProvider() {
  let state: Record<string, any> | null = { user: { name: 'You' }, cursor: null }
  return {
    awareness: {
      getLocalState: () => state,
      setLocalStateField: vi.fn((key: string, value: unknown) => {
        if (state) state = { ...state, [key]: JSON.parse(JSON.stringify(value)) }
      }),
    },
    disconnect: () => {
      state = null
    },
  }
}

const editors: Editor[] = []
const documents: Y.Doc[] = []

function createDocument() {
  const doc = new Y.Doc()
  documents.push(doc)
  return doc
}

function createEditor(options: {
  doc: Y.Doc
  provider: ReturnType<typeof createProvider>
  field?: string
}) {
  return new Promise<Editor>(resolve => {
    const editor = new Editor({
      element: document.body.appendChild(document.createElement('div')),
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Collaboration.configure({ document: options.doc, field: options.field ?? 'default' }),
        ServerAiToolkit,
        AiSelectionAwareness.configure({ provider: options.provider, userId: 'user-1' }),
      ],
      onCreate: ({ editor: created }) => {
        created.commands.setContent('<p>Hello world</p>')
        resolve(created)
      },
    })
    editors.push(editor)
  })
}

function resolveSelection(
  editor: Editor,
  provider: ReturnType<typeof createProvider>,
  field = 'default',
) {
  const entry = provider.awareness.getLocalState()?.aiToolkitSelection.fields[field]
  if (!entry?.anchor || !entry?.head) return null
  const sync = ySyncPluginKey.getState(editor.state)
  return {
    anchor: relativePositionToAbsolutePosition(
      sync.doc,
      sync.type,
      Y.createRelativePositionFromJSON(entry.anchor),
      sync.binding.mapping,
    ),
    head: relativePositionToAbsolutePosition(
      sync.doc,
      sync.type,
      Y.createRelativePositionFromJSON(entry.head),
      sync.binding.mapping,
    ),
  }
}

afterEach(() => {
  editors.splice(0).forEach(editor => editor.destroy())
  documents.splice(0).forEach(doc => doc.destroy())
  document.body.innerHTML = ''
})

describe('AI selection awareness', () => {
  it('publishes without collaboration caret and keeps the selection on blur', async () => {
    const provider = createProvider()
    const editor = await createEditor({ doc: createDocument(), provider })
    editor.commands.setTextSelection({ from: 1, to: 6 })
    editor.view.focus()
    editor.view.dom.blur()
    editor.view.dom.dispatchEvent(new FocusEvent('focusout'))
    provider.awareness.setLocalStateField('cursor', null)

    expect(resolveSelection(editor, provider)).toEqual({ anchor: 1, head: 6 })
    expect(provider.awareness.getLocalState()?.user).toEqual({ name: 'You' })
    expect(provider.awareness.getLocalState()?.aiToolkitSelection.fields.default.userId).toBe(
      'user-1',
    )
  })

  it('tracks backward selections and explicit changes while blurred', async () => {
    const provider = createProvider()
    const editor = await createEditor({ doc: createDocument(), provider })
    editor.commands.setTextSelection({ from: 10, to: 3 })
    expect(resolveSelection(editor, provider)).toEqual({ anchor: 10, head: 3 })
    editor.commands.setTextSelection(5)
    expect(resolveSelection(editor, provider)).toEqual({ anchor: 5, head: 5 })
  })

  it('isolates selections for editors sharing a provider and clears only the destroyed field', async () => {
    const provider = createProvider()
    const doc = createDocument()
    const title = await createEditor({ doc, provider, field: 'title' })
    const body = await createEditor({ doc, provider, field: 'body' })
    title.commands.setTextSelection({ from: 1, to: 6 })
    body.commands.setTextSelection({ from: 7, to: 12 })
    expect(resolveSelection(title, provider, 'title')).toEqual({ anchor: 1, head: 6 })
    expect(resolveSelection(body, provider, 'body')).toEqual({ anchor: 7, head: 12 })

    title.destroy()
    expect(resolveSelection(title, provider, 'title')).toBeNull()
    expect(resolveSelection(body, provider, 'body')).toEqual({ anchor: 7, head: 12 })
    expect(provider.awareness.getLocalState()?.aiToolkitSelection.fields.title).toEqual({
      userId: 'user-1',
      anchor: null,
      head: null,
    })
  })

  it('keeps relative positions anchored to the selected text across remote edits while blurred', async () => {
    const provider = createProvider()
    const doc = createDocument()
    const editor = await createEditor({ doc, provider })
    editor.commands.setTextSelection({ from: 7, to: 12 })
    const before = provider.awareness.getLocalState()?.aiToolkitSelection
    const peer = createDocument()
    Y.applyUpdate(peer, Y.encodeStateAsUpdate(doc))
    const paragraph = peer.getXmlFragment('default').get(0)
    if (!(paragraph instanceof Y.XmlElement)) throw new Error('Expected paragraph')
    const text = paragraph.get(0)
    if (!(text instanceof Y.XmlText)) throw new Error('Expected text')
    text.insert(0, 'Hey! ')
    Y.applyUpdate(doc, Y.encodeStateAsUpdate(peer))

    expect(provider.awareness.getLocalState()?.aiToolkitSelection).toEqual(before)
    expect(resolveSelection(editor, provider)).toEqual({ anchor: 12, head: 17 })
    expect(editor.state.doc.textBetween(12, 17)).toBe('world')
    text.delete(11, 5)
    Y.applyUpdate(doc, Y.encodeStateAsUpdate(peer))
    const selection = resolveSelection(editor, provider)
    expect(selection?.anchor).toBe(selection?.head)
  })

  it('does not publish redundant updates or recreate disconnected awareness on destruction', async () => {
    const provider = createProvider()
    const editor = await createEditor({ doc: createDocument(), provider })
    editor.commands.setTextSelection({ from: 1, to: 6 })
    provider.awareness.setLocalStateField.mockClear()
    editor.view.dispatch(editor.state.tr.setMeta('unrelated', true))
    expect(provider.awareness.setLocalStateField).not.toHaveBeenCalled()
    provider.disconnect()
    editor.destroy()
    expect(provider.awareness.setLocalStateField).not.toHaveBeenCalled()
  })
})
