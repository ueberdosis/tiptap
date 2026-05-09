import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'

import { EditorContent, useEditor } from '../src/index.js'

describe('useEditor', () => {
  const mountedElements: HTMLElement[] = []

  afterEach(() => {
    mountedElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })

    mountedElements.length = 0
  })

  it('should not replace Vue-owned DOM on unmount', async () => {
    const replaceChildSpy = vi.spyOn(Node.prototype, 'replaceChild')

    try {
      const TestComponent = defineComponent({
        setup() {
          const editor = useEditor({
            extensions: [Document, Paragraph, Text],
            content: '<p>Hello World</p>',
          })

          return () => h(EditorContent, { editor: editor.value })
        },
      })

      const app = createApp(TestComponent)
      const target = document.createElement('div')

      document.body.appendChild(target)
      mountedElements.push(target)

      app.mount(target)
      await nextTick()
      await nextTick()

      expect(() => app.unmount()).not.toThrow()
      expect(replaceChildSpy).not.toHaveBeenCalled()
    } finally {
      replaceChildSpy.mockRestore()
    }
  })
})
