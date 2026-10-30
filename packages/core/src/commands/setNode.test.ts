import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from '../Editor.js'

describe('setNode / setParagraph', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('setParagraph lifts out of a blockquote even when setBlockType is a no-op', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Blockquote],
      content: '<blockquote><p>quoted</p></blockquote>',
    })

    editor.commands.setTextSelection(2)

    const handled = editor.commands.setParagraph()

    expect(handled).toBe(true)
    expect(editor.getHTML()).toBe('<p>quoted</p>')
  })
})
