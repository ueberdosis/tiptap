import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { expect, it } from 'vite-plus/test'
import { nextTick, watchEffect } from 'vue'

import { Editor } from './Editor.js'

it('updates Vue effects that read the editor state', async () => {
  const editor = new Editor({ extensions: [Document, Paragraph, Text] })
  let text = ''
  const stop = watchEffect(() => {
    text = editor.state.doc.textContent
  })

  try {
    editor.commands.insertContent('Hello')

    await new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
    await nextTick()

    expect(text).toBe('Hello')
  } finally {
    stop()
    editor.destroy()
  }
})
