import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { BulletList, ListItem, ListKeymap } from '../../src/index.js'

function dispatchDelete(editor: Editor) {
  return editor.view.someProp('handleKeyDown', f =>
    f(
      editor.view,
      new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }),
    ),
  )
}

describe('ListKeymap Delete with a selection across list items (#8543)', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('deletes the selected text when the selection starts at the end of an item', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BulletList, ListItem, ListKeymap],
      content: '<ul><li><p>one</p></li><li><p>two</p></li></ul>',
    })

    editor.commands.setTextSelection({ from: 6, to: 11 })

    expect(dispatchDelete(editor)).toBe(true)
    expect(editor.getHTML()).toBe('<ul><li><p>onewo</p></li></ul>')
  })
})
