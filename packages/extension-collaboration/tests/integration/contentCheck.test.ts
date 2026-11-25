import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import * as Y from 'yjs'

import Collaboration from '@tiptap/extension-collaboration'

const createSharedDocument = () => {
  const ydoc = new Y.Doc()
  const fragment = ydoc.getXmlFragment('default')
  const paragraph = new Y.XmlElement('paragraph')

  paragraph.insert(0, [new Y.XmlText('Kept')])
  fragment.insert(0, [paragraph, new Y.XmlElement('unknownNode')])

  return { ydoc, fragment }
}

describe('content check with collaboration', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
  })

  it('keeps shared content the schema cannot show and emits contentError', () => {
    const { ydoc, fragment } = createSharedDocument()
    const sharedContent = fragment.toString()
    const updates: Uint8Array[] = []
    const onContentError = vi.fn()

    ydoc.on('update', (update: Uint8Array) => updates.push(update))
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
      enableContentCheck: true,
      onContentError,
    })

    expect(onContentError).toHaveBeenCalledOnce()
    expect(onContentError.mock.calls[0][0].error).toBeInstanceOf(Error)
    expect(editor.isEditable).toBe(false)
    expect(editor.getText()).toBe('Kept')
    expect(fragment.toString()).toBe(sharedContent)
    expect(updates).toHaveLength(0)
  })

  it('stops syncing when the app disables collaboration', () => {
    const { ydoc } = createSharedDocument()
    const destroy = vi.spyOn(ydoc, 'destroy')

    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
      enableContentCheck: true,
      onContentError: ({ editor: contentErrorEditor, disableCollaboration }) => {
        disableCollaboration()
        contentErrorEditor.setEditable(false, false)
      },
    })

    expect(editor.storage.collaboration.isDisabled).toBe(true)
    expect(editor.isEditable).toBe(false)
    expect(destroy).toHaveBeenCalled()
  })

  it('repairs shared content when the content check is off', () => {
    const { ydoc, fragment } = createSharedDocument()
    const onContentError = vi.fn()

    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, Text, Collaboration.configure({ document: ydoc })],
      onContentError,
    })

    expect(onContentError).not.toHaveBeenCalled()
    expect(editor.isEditable).toBe(true)
    expect(fragment.toString()).toBe('<paragraph>Kept</paragraph>')
  })
})
