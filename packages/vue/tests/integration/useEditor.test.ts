import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import type { ComponentInternalInstance, ShallowRef } from 'vue'
import { createApp, defineComponent, getCurrentInstance, h, nextTick } from 'vue'

import type { Editor } from '../../src/index.js'
import { EditorContent, useEditor } from '../../src/index.js'

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
          // oxlint-disable-next-line react-hooks/rules-of-hooks
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

  it('should destroy the previous editor when mounted again', async () => {
    let instance: ComponentInternalInstance | null = null
    let editor: ShallowRef<Editor | undefined> | undefined

    const TestComponent = defineComponent({
      setup() {
        instance = getCurrentInstance()
        // oxlint-disable-next-line react-hooks/rules-of-hooks
        editor = useEditor({
          extensions: [Document, Paragraph, Text],
          content: '<p>Hello World</p>',
        })

        return () => h(EditorContent, { editor: editor?.value })
      },
    })

    const app = createApp(TestComponent)
    const target = document.createElement('div')

    document.body.appendChild(target)
    mountedElements.push(target)

    app.mount(target)
    await nextTick()
    await nextTick()

    const firstEditor = editor?.value

    // Nuxt can call `onMounted` twice on the same component instance during hydration
    instance!.m?.forEach(hook => hook())
    await nextTick()
    await nextTick()

    expect(firstEditor?.isDestroyed).toBe(true)
    expect(target.querySelectorAll('.ProseMirror')).toHaveLength(1)

    app.unmount()
  })
})
