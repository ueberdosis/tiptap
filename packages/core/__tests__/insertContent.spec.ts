import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

describe('insertContent', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('inserts plain text object {type: "text", text: "world"}', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>hello</p>',
    })

    // Place cursor at the end of "hello" (position 6)
    editor.commands.setTextSelection(6)

    const result = editor.commands.insertContent({ type: 'text', text: 'world' })

    expect(result).toBe(true)
    expect(editor.getHTML()).toBe('<p>helloworld</p>')
  })
})
