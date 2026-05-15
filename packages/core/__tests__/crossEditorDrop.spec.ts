import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

const extensions = [Document, Paragraph, Text]

describe('crossEditorDrop', () => {
  it('defaults to move', () => {
    const editor = new Editor({ extensions })

    expect(editor.options.crossEditorDrop).toBe('move')

    editor.destroy()
  })

  it('can be set to copy', () => {
    const editor = new Editor({
      extensions,
      crossEditorDrop: 'copy',
    })

    expect(editor.options.crossEditorDrop).toBe('copy')

    editor.destroy()
  })
})
