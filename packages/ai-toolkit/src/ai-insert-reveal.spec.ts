// @vitest-environment happy-dom

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'

import { AiInsertReveal } from './ai-insert-reveal.js'

/**
 * Creates an editor with the {@link AiInsertReveal} extension and no
 * collaboration, to prove the extension loads and degrades gracefully when the
 * y-sync plugin it reads is absent.
 *
 * @return Promise resolving once the editor create lifecycle has finished.
 */
function createEditor(): Promise<Editor> {
  return new Promise(resolve => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit, AiInsertReveal],
      content: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      },
      onCreate: () => {
        resolve(editor)
      },
    })
  })
}

describe('AiInsertReveal', () => {
  it('is a named Tiptap extension', () => {
    expect(AiInsertReveal.name).toBe('aiInsertReveal')
  })

  it('registers and degrades to a no-op when no collaboration y-sync plugin is present', async () => {
    const editor = await createEditor()

    expect(editor.extensionManager.extensions.some(e => e.name === 'aiInsertReveal')).toBe(true)
    // Without a y-sync plugin the decorations source resolves to nothing, so the
    // editor renders normally rather than throwing.
    expect(editor.getText()).toBe('Hello')

    editor.destroy()
  })

  it('applies configured className and durationMs', async () => {
    const editor = await new Promise<Editor>(resolve => {
      const created = new Editor({
        element: document.createElement('div'),
        extensions: [
          StarterKit,
          AiInsertReveal.configure({ className: 'custom-reveal', durationMs: 300 }),
        ],
        onCreate: () => resolve(created),
      })
    })

    const reveal = editor.extensionManager.extensions.find(e => e.name === 'aiInsertReveal')
    expect(reveal?.options).toMatchObject({ className: 'custom-reveal', durationMs: 300 })

    editor.destroy()
  })
})
