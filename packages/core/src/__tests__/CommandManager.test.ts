import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

const createEditor = (options: ConstructorParameters<typeof Editor>[0] = {}) => {
  return new Editor({
    extensions: [Document, Paragraph, Text, Bold],
    content: '<p>Hello world</p>',
    ...options,
  })
}

describe('CommandManager', () => {
  describe('after the editor has been destroyed', () => {
    it('editor.commands no longer throws and safely no-ops', () => {
      const editor = createEditor()

      editor.destroy()

      expect(() => editor.commands.toggleBold()).not.toThrow()
      expect(editor.commands.toggleBold()).toBe(false)
    })

    it('editor.chain().run() no longer throws and safely no-ops', () => {
      const editor = createEditor()

      editor.destroy()

      let result: boolean | undefined

      expect(() => {
        result = editor.chain().toggleBold().run()
      }).not.toThrow()
      expect(result).toBe(false)
    })

    it('editor.can() no longer throws and safely no-ops', () => {
      const editor = createEditor()

      editor.destroy()

      expect(() => editor.can().toggleBold()).not.toThrow()
      expect(editor.can().toggleBold()).toBe(false)
    })

    it('editor.can().chain().run() no longer throws and safely no-ops', () => {
      const editor = createEditor()

      editor.destroy()

      let result: boolean | undefined

      expect(() => {
        result = editor.can().chain().toggleBold().run()
      }).not.toThrow()
      expect(result).toBe(false)
    })
  })

  describe('before the editor has been destroyed', () => {
    it('a never-mounted (headless) editor still executes commands normally', () => {
      const editor = createEditor({ element: null })

      expect(editor.isDestroyed).toBe(true)

      expect(editor.can().chain().toggleBold().run()).toBe(true)
      expect(editor.chain().toggleBold().run()).toBe(true)
      expect(editor.isActive('bold')).toBe(true)

      editor.destroy()
    })
  })
})
