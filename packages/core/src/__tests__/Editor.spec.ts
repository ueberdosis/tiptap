import { describe, expect, it } from 'vitest'
import { Editor } from '../Editor.js'
import StarterKit from '@tiptap/starter-kit'

const createTestEditor = () =>
  new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit],
  })

describe('Editor', () => {
  describe('destroy', () => {
    it('should keep the command chain accessible after the editor is destroyed', () => {
      const editor = createTestEditor()

      expect(editor.isDestroyed).toBe(false)
      expect(editor.chain).not.toBe(null)

      editor.destroy()

      expect(editor.isDestroyed).toBe(true)
      expect(editor.chain).not.toBe(null)
      expect(editor.chain().setContent('').run()).toBe(false)
    })

    it('should keep the command can accessible after the editor is destroyed', () => {
      const editor = createTestEditor()

      expect(editor.isDestroyed).toBe(false)
      expect(editor.can).not.toBe(null)

      editor.destroy()

      expect(editor.isDestroyed).toBe(true)
      expect(editor.can).not.toBe(null)

      // can on command
      expect(editor.can().setContent('')).toBe(false)

      // can on chain
      expect(editor.can().chain().setContent('').blur().run()).toBe(false)
    })
  })
})
