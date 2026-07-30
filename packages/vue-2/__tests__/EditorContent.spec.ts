import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'
import Vue from 'vue'

import { Editor, EditorContent } from '../src/index.js'

describe('EditorContent', () => {
  const mountedVms: Vue[] = []
  const mountedElements: HTMLElement[] = []

  afterEach(() => {
    mountedVms.forEach(vm => vm.$destroy())
    mountedVms.length = 0

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

    const vm = new Vue({
      render: createElement => createElement(EditorContent, { props: { editor } }),
    })

    vm.$mount(target)
    mountedVms.push(vm)

    return { vm, shadowRoot }
  }

  it('re-resolves the ProseMirror root when remounted into another shadow tree', async () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello World</p>',
    })

    try {
      const first = mountEditorContentInShadowRoot(editor)

      await Vue.nextTick()
      await Vue.nextTick()

      // Populate ProseMirror's lazy root cache, like any selection work would.
      expect(editor.view.root).toBe(first.shadowRoot)

      first.vm.$destroy()

      const second = mountEditorContentInShadowRoot(editor)

      await Vue.nextTick()
      await Vue.nextTick()

      expect(editor.view.dom.getRootNode()).toBe(second.shadowRoot)
      // A stale root breaks all selection handling: the cursor no longer
      // follows clicks because ProseMirror consults the discarded shadow root.
      expect(editor.view.root).toBe(second.shadowRoot)
    } finally {
      editor.destroy()
    }
  })
})
