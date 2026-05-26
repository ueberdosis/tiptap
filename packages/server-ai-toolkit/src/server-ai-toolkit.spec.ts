// @vitest-environment happy-dom

import { Editor, Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'

import { ServerAiToolkit } from './index.js'

/**
 * Options for creating a test editor.
 */
interface CreateEditorOptions {
  /**
   * Initial document JSON.
   */
  content?: Record<string, unknown>

  /**
   * Additional extensions to include alongside the default ones.
   */
  extensions?: Extension[]
}

/**
 * Creates an editor configured with the {@link ServerAiToolkit} extension.
 *
 * @param options - Editor configuration options.
 * @return Promise resolving once the editor create lifecycle has finished.
 */
function createEditor(options: CreateEditorOptions): Promise<Editor> {
  return new Promise(resolve => {
    const editor = new Editor({
      element: document.createElement('div'),
      content: options.content,
      extensions: [StarterKit, ServerAiToolkit, ...(options.extensions ?? [])],
      onCreate: () => {
        resolve(editor)
      },
    })
  })
}

/**
 * Creates an editor with an explicit extension order.
 *
 * @param extensions - Extensions to register in the desired order.
 * @param content - Initial document JSON.
 * @return Promise resolving once the editor create lifecycle has finished.
 */
function createEditorWithExplicitExtensions(
  extensions: Extension[],
  content?: Record<string, unknown>,
): Promise<Editor> {
  return new Promise(resolve => {
    const editor = new Editor({
      element: document.createElement('div'),
      content,
      extensions,
      onCreate: () => {
        resolve(editor)
      },
    })
  })
}

const MockAiToolkit = Extension.create({
  name: 'aiToolkit',
})

describe('ServerAiToolkit', () => {
  it('registers _hash attributes without generating values on creation', async () => {
    const editor = await createEditor({
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
        ],
      },
    })

    const paragraphs = editor.getJSON().content ?? []

    expect(paragraphs).toHaveLength(2)
    // oxlint-disable-next-line no-underscore-dangle
    expect(paragraphs[0]?.attrs?._hash ?? null).toBeNull()
    // oxlint-disable-next-line no-underscore-dangle
    expect(paragraphs[1]?.attrs?._hash ?? null).toBeNull()

    editor.destroy()
  })

  it('preserves provided hashes through a JSON round-trip', async () => {
    const firstEditor = await createEditor({
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { _hash: 'ABC123' },
            content: [{ type: 'text', text: 'Hello' }],
          },
        ],
      },
    })

    const firstJson = firstEditor.getJSON()
    // oxlint-disable-next-line no-underscore-dangle
    const firstHash = firstJson.content?.[0]?.attrs?._hash

    firstEditor.destroy()

    const secondEditor = await createEditor({
      content: firstJson,
    })

    const secondJson = secondEditor.getJSON()
    // oxlint-disable-next-line no-underscore-dangle
    const secondHash = secondJson.content?.[0]?.attrs?._hash

    expect(secondHash).toBe(firstHash)

    secondEditor.destroy()
  })

  it('does not synthesize hashes when the AI Toolkit extension is present', async () => {
    const editor = await createEditorWithExplicitExtensions(
      [StarterKit, ServerAiToolkit, MockAiToolkit],
      {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First' }] }],
      },
    )

    // oxlint-disable-next-line no-underscore-dangle
    expect(editor.getJSON().content?.[0]?.attrs?._hash ?? null).toBeNull()

    editor.destroy()
  })
})
