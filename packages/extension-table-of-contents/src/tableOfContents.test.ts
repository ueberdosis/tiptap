import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { TableOfContents } from './tableOfContents.js'

describe('TableOfContents', () => {
  let editor: Editor | undefined

  afterEach(() => {
    editor?.destroy()
    editor = undefined
  })

  it('refreshes anchor DOM references after remount without a content change', () => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, Text, Heading, TableOfContents],
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1, id: 'intro', 'data-toc-id': 'intro' },
            content: [{ type: 'text', text: 'Intro' }],
          },
        ],
      },
    })

    const originalAnchor = editor.storage.tableOfContents.anchors[0]
    const doc = editor.state.doc

    editor.unmount()
    editor.mount(document.createElement('div'))

    expect(editor.state.doc).toBe(doc)
    expect(editor.storage.tableOfContents.anchors[0]).not.toBe(originalAnchor)
    expect(editor.storage.tableOfContents.anchors[0]).toBe(editor.view.dom.querySelector('h1'))
  })
})
