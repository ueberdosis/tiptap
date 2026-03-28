import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import { describe, expect, it, vi } from 'vitest'

const InlineDocument = Document.extend({
  content: 'inline*',
})

describe('delete extension', () => {
  it('should not throw when removing a mark from inline content at position 0', () => {
    const onDelete = vi.fn()
    const editor = new Editor({
      extensions: [InlineDocument, Text, Bold],
      content: 'hello world',
      onDelete,
      coreExtensionOptions: {
        delete: {
          async: false,
        },
      },
    })

    editor.commands.selectAll()
    editor.commands.setMark('bold')
    editor.commands.selectAll()

    expect(() => editor.commands.unsetMark('bold')).not.toThrow()
    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'hello world',
        },
      ],
    })
    expect(onDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mark',
        partial: false,
      }),
    )

    editor.destroy()
  })
})
