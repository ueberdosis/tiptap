import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'

import { EditorContent, useEditor } from '../src/index.js'

const extensions = [Document, Paragraph, Text]

const content = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
}

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

  it('leaves the editor ref empty when the document version is too new on init', async () => {
    const onMigrateError = vi.fn()

    const TestComponent = defineComponent({
      setup() {
        const editor = useEditor({
          extensions,
          data: {
            content,
            documentVersion: 99,
            meta: {},
          },
          migrations: [
            {
              version: 2,
              migrate: node => node,
            },
          ],
          onMigrateError,
        })

        return () => h('div', editor.value ? 'yes' : 'no')
      },
    })

    const app = createApp(TestComponent)
    const target = document.createElement('div')

    document.body.appendChild(target)
    mountedElements.push(target)

    app.mount(target)
    await nextTick()
    await nextTick()

    expect(target.textContent).toBe('no')
    expect(onMigrateError).toHaveBeenCalledTimes(1)

    app.unmount()
  })

  it('clears the editor ref when documentVersion becomes too new at runtime', async () => {
    const onMigrateError = vi.fn()
    const editorRef = { current: undefined as ReturnType<typeof useEditor> | undefined }

    const TestComponentWithRef = defineComponent({
      setup() {
        const editor = useEditor({
          extensions,
          data: {
            content,
            documentVersion: 2,
            meta: {},
          },
          migrations: [{ version: 2, migrate: node => node }],
          onMigrateError,
        })

        editorRef.current = editor

        return () =>
          h('button', {
            type: 'button',
            onClick: () => editor.value?.setDocumentVersion(99),
          })
      },
    })

    const appWithRef = createApp(TestComponentWithRef)
    const targetWithRef = document.createElement('div')

    document.body.appendChild(targetWithRef)
    mountedElements.push(targetWithRef)

    appWithRef.mount(targetWithRef)
    await nextTick()
    await nextTick()

    expect(editorRef.current?.value).toBeDefined()

    ;(targetWithRef.querySelector('button') as HTMLButtonElement).click()
    await nextTick()

    expect(onMigrateError).toHaveBeenCalledTimes(1)
    expect(editorRef.current?.value).toBeUndefined()

    appWithRef.unmount()
  })

  it('forwards onDestroy when core destroys the editor after a migration error', async () => {
    const onDestroy = vi.fn()
    const onMigrateError = vi.fn()

    const TestComponent = defineComponent({
      setup() {
        const editor = useEditor({
          extensions,
          data: {
            content,
            documentVersion: 2,
            meta: {},
          },
          migrations: [{ version: 2, migrate: node => node }],
          onDestroy,
          onMigrateError,
        })

        return () =>
          h('button', {
            type: 'button',
            onClick: () => editor.value?.setDocumentVersion(99),
          })
      },
    })

    const app = createApp(TestComponent)
    const target = document.createElement('div')

    document.body.appendChild(target)
    mountedElements.push(target)

    app.mount(target)
    await nextTick()
    await nextTick()

    ;(target.querySelector('button') as HTMLButtonElement).click()
    await nextTick()

    expect(onMigrateError).toHaveBeenCalledTimes(1)
    expect(onDestroy).toHaveBeenCalledTimes(1)

    app.unmount()
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
})
