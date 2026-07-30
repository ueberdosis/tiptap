import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'
import type { App } from 'vue'
import { createApp, h, nextTick } from 'vue'

import { Editor, EditorContent } from '../src/index.js'

describe('EditorContent', () => {
  const mountedApps: App[] = []
  const mountedElements: HTMLElement[] = []

  afterEach(() => {
    mountedApps.forEach(app => app.unmount())
    mountedApps.length = 0

    mountedElements.forEach(element => element.remove())
    mountedElements.length = 0
  })

  function mountEditorContentInShadowRoot(editor: Editor) {
    const host = document.createElement('div')

    document.body.appendChild(host)
    mountedElements.push(host)

    const shadowRoot = host.attachShadow({ mode: 'open' })
    const target = document.createElement('div')

    shadowRoot.appendChild(target)

    const app = createApp({ render: () => h(EditorContent, { editor }) })

    app.mount(target)
    mountedApps.push(app)

    return { app, shadowRoot }
  }

  it('re-resolves the ProseMirror root when remounted into another shadow tree', async () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello World</p>',
    })

    try {
      const first = mountEditorContentInShadowRoot(editor)

      await nextTick()
      await nextTick()

      // Populate ProseMirror's lazy root cache, like any selection work would.
      expect(editor.view.root).toBe(first.shadowRoot)

      first.app.unmount()

      const second = mountEditorContentInShadowRoot(editor)

      await nextTick()
      await nextTick()

      expect(editor.view.dom.getRootNode()).toBe(second.shadowRoot)
      // A stale root breaks all selection handling: the cursor no longer
      // follows clicks because ProseMirror consults the discarded shadow root.
      expect(editor.view.root).toBe(second.shadowRoot)
    } finally {
      editor.destroy()
    }
  })
})
