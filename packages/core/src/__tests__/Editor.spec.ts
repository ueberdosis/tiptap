import { describe, expect, it } from 'vite-plus/test'
import { Editor } from '../Editor.js'
import { Extension } from '../Extension.js'
import StarterKit from '@tiptap/starter-kit'

const createTestEditor = () =>
  new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit],
  })

describe('Editor', () => {
  it('keeps command fallbacks available while commands initialize', async () => {
    let chain: ReturnType<Editor['chain']> | undefined
    let can: ReturnType<Editor['can']> | undefined

    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [
        StarterKit,
        Extension.create({
          name: 'initialization-test',
          addCommands() {
            chain = this.editor.chain()
            can = this.editor.can()

            return {}
          },
        }),
      ],
    })

    expect(chain?.focus().run()).toBe(false)
    expect(can?.focus()).toBe(false)
    expect(await Promise.resolve(chain)).toBe(chain)
    expect(await Promise.resolve(can)).toBe(can)

    editor.destroy()
  })

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
