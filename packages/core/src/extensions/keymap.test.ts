import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { TextSelection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from '../Editor.js'

describe('keymap extension', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
  })

  const createEditor = (content: string) => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold],
      content,
    })

    return editor
  }

  describe('clearDocument', () => {
    it('drops the stored marks when a text selection over the whole document is deleted', () => {
      const editor = createEditor('<p><strong>bold</strong> text</p>')
      const { doc } = editor.state

      editor.commands.setTextSelection({ from: 1, to: doc.content.size - 1 })
      expect(editor.state.selection).toBeInstanceOf(TextSelection)

      editor.commands.deleteSelection()

      expect(editor.state.storedMarks).toBeNull()
      expect(editor.isActive('bold')).toBe(false)

      editor.view.dispatch(editor.state.tr.insertText('typed'))

      expect(editor.getHTML()).toBe('<p>typed</p>')
    })

    it('keeps the stored marks when only part of the document is deleted', () => {
      const editor = createEditor('<p><strong>bold</strong> text</p>')

      editor.commands.setTextSelection({ from: 1, to: 5 })
      editor.commands.deleteSelection()

      expect(editor.state.storedMarks?.map(mark => mark.type.name)).toEqual(['bold'])
    })
  })
})
