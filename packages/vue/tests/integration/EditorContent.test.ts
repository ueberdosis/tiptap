import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { createApp, h, nextTick, shallowRef } from 'vue'

import { Editor, EditorContent } from '../../src/index.js'

describe('EditorContent', () => {
  const mountedElements: HTMLElement[] = []

  afterEach(() => {
    mountedElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })

    mountedElements.length = 0
  })

  it('should replace the mounted view when the editor is replaced', async () => {
    const createEditor = (content: string) =>
      new Editor({
        extensions: [Document, Paragraph, Text],
        content,
      })

    const firstEditor = createEditor('<p>first</p>')
    const editor = shallowRef<Editor>(firstEditor)

    const app = createApp({
      render: () => h(EditorContent, { editor: editor.value }),
    })
    const target = document.createElement('div')

    document.body.appendChild(target)
    mountedElements.push(target)

    app.mount(target)
    await nextTick()
    await nextTick()

    expect(target.querySelectorAll('.ProseMirror')).toHaveLength(1)

    editor.value = createEditor('<p>second</p>')
    await nextTick()
    await nextTick()

    expect(target.querySelectorAll('.ProseMirror')).toHaveLength(1)
    expect(target.textContent).toBe('second')

    const secondEditor = editor.value

    editor.value = firstEditor
    await nextTick()
    await nextTick()

    expect(target.querySelectorAll('.ProseMirror')).toHaveLength(1)
    expect(target.textContent).toBe('first')

    app.unmount()
    firstEditor.destroy()
    secondEditor.destroy()
  })
})
