import { describe, expect, it } from 'vite-plus/test'
import { Editor } from '../Editor.js'
import { Extension } from '../Extension.js'
import StarterKit from '@tiptap/starter-kit'

const createTestEditor = () =>
  new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit],
    content: '<p>Hello</p>',
  })

describe('Editor', () => {
  it('keeps command fallbacks available while commands initialize', async () => {
    let commands: Editor['commands'] | undefined
    let chain: ReturnType<Editor['chain']> | undefined
    let can: ReturnType<Editor['can']> | undefined

    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [
        StarterKit,
        Extension.create({
          name: 'initialization-test',
          addCommands() {
            commands = this.editor.commands
            chain = this.editor.chain()
            can = this.editor.can()

            return {}
          },
        }),
      ],
    })

    expect(commands?.setContent('')).toBe(false)
    expect(chain?.focus().run()).toBe(false)
    expect(can?.focus()).toBe(false)
    expect(await Promise.resolve(commands)).toBe(commands)
    expect(await Promise.resolve(chain)).toBe(chain)
    expect(await Promise.resolve(can)).toBe(can)

    editor.destroy()
  })

  describe('destroy', () => {
    it('should keep commands accessible after the editor is destroyed', async () => {
      const editor = createTestEditor()

      expect(editor.commands.setContent('')).toBe(true)

      editor.destroy()

      const commands = editor.commands

      expect(editor.isDestroyed).toBe(true)
      expect(commands.setContent('')).toBe(false)
      expect(commands.focus()).toBe(false)

      // Fallback proxies must not look like promises
      expect((commands as any).then).toBeUndefined()
      expect(await Promise.resolve(commands)).toBe(commands)
    })

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

    it('should return an empty string from getHTML after the editor is destroyed', () => {
      const editor = createTestEditor()

      expect(editor.getHTML()).toBe('<p>Hello</p>')

      editor.destroy()

      expect(editor.getHTML()).toBe('')
    })

    it('should return an empty string from getText after the editor is destroyed', () => {
      const editor = createTestEditor()

      expect(editor.getText()).toBe('Hello')

      editor.destroy()

      expect(editor.getText()).toBe('')
    })
  })
})
