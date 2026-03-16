import { Editor, Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it, vi } from 'vitest'

import { Suggestion } from '../suggestion.js'

describe('suggestion integration', () => {
  it('should respect shouldShow returning false', async () => {
    const shouldShow = vi.fn().mockReturnValue(false)
    const items = vi.fn().mockReturnValue([])
    const render = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-false',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            shouldShow,
            items,
            render: () => ({
              onStart: render,
              onUpdate: render,
              onExit: render,
            }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()

    // Flush microtasks because plugin view update is async
    await Promise.resolve()

    expect(shouldShow).toHaveBeenCalled()
    expect(render).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('should respect shouldShow returning true', async () => {
    const shouldShow = vi.fn().mockReturnValue(true)
    const render = vi.fn()
    const items = vi.fn().mockReturnValue([])

    const MentionExtension = Extension.create({
      name: 'mention-true',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            shouldShow,
            items,
            render: () => ({
              onStart: render,
              onUpdate: render,
              onExit: render,
            }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()

    // Flush microtasks because plugin view update is async
    await Promise.resolve()

    expect(shouldShow).toHaveBeenCalled()
    expect(render).toHaveBeenCalled()

    editor.destroy()
  })

  it('should pass transaction to shouldShow', async () => {
    let capturedProps: any = null
    const shouldShow = vi.fn(props => {
      capturedProps = props
      return true
    })

    const MentionExtension = Extension.create({
      name: 'mention-props',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            shouldShow,
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()

    // Flush microtasks
    await Promise.resolve()

    // The transaction is passed as a flat property
    expect(capturedProps.transaction).toBeDefined()
    expect(capturedProps.query).toBe('')
    expect(capturedProps.text).toBe('@')
    // Check that we receive the correct editor instance
    expect(capturedProps.editor).toBe(editor)

    editor.destroy()
  })
})
