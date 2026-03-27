import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it, vi } from 'vitest'

describe('delete event', () => {
  describe('mark deletion', () => {
    it('should not throw when removing a mark at position 0 with inline content', () => {
      const TitleDocument = Document.extend({ content: 'inline*' })

      const onDelete = vi.fn()

      const editor = new Editor({
        extensions: [TitleDocument, Text, Bold],
        content: 'Hello world',
        coreExtensionOptions: {
          delete: {
            async: false,
          },
        },
        onDelete,
      })

      editor.chain().focus().selectAll().setBold().run()

      expect(() => {
        editor.chain().focus().selectAll().unsetMark('bold').run()
      }).not.toThrow()

      expect(onDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'mark',
        }),
      )

      editor.destroy()
    })

    it('should emit delete event with partial false when removing a mark spanning entire content at position 0', () => {
      const TitleDocument = Document.extend({ content: 'inline*' })

      const onDelete = vi.fn()

      const editor = new Editor({
        extensions: [TitleDocument, Text, Bold],
        content: 'Hello world',
        coreExtensionOptions: {
          delete: {
            async: false,
          },
        },
        onDelete,
      })

      editor.chain().focus().selectAll().setBold().run()
      editor.chain().focus().selectAll().unsetMark('bold').run()

      expect(onDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'mark',
          partial: false,
        }),
      )

      editor.destroy()
    })

    it('should emit delete event with partial true when mark remains on adjacent content', () => {
      const onDelete = vi.fn()

      const editor = new Editor({
        extensions: [Document, Paragraph, Text, Bold],
        content: '<p><strong>Hello world</strong></p>',
        coreExtensionOptions: {
          delete: {
            async: false,
          },
        },
        onDelete,
      })

      // Select only part of the bold text and remove the mark
      editor.chain().focus().setTextSelection({ from: 2, to: 7 }).unsetMark('bold').run()

      expect(onDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'mark',
          partial: true,
        }),
      )

      editor.destroy()
    })
  })
})
