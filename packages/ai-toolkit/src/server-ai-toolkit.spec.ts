// @vitest-environment happy-dom

import { Editor, Extension, type Extensions, Node } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vite-plus/test'

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
  extensions?: Extensions
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
  extensions: Extensions,
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

// Inline nodes are not always grouped `inline`.
const InlineNodeWithCustomGroup = Node.create({
  name: 'inlineNodeWithCustomGroup',
  inline: true,
  group: 'someCustom',
  parseHTML() {
    return [{ tag: 'inline-node-with-custom-group' }]
  },
  renderHTML() {
    return ['inline-node-with-custom-group']
  },
})

// `inline` may read the editor, which is not available while attributes are built.
const NodeReadingEditorInInline = Node.create({
  name: 'nodeReadingEditorInInline',
  inline() {
    return this.editor!.isEditable
  },
  group: 'inline',
  parseHTML() {
    return [{ tag: 'node-reading-editor-in-inline' }]
  },
  renderHTML() {
    return ['node-reading-editor-in-inline']
  },
})

/**
 * Checks whether a node type has the `_hash` attribute registered.
 *
 * @param editor - The editor to inspect.
 * @param typeName - The node type name.
 * @return `true` when `_hash` is registered on the node type.
 */
function hasHashAttribute(editor: Editor, typeName: string): boolean {
  // oxlint-disable-next-line no-underscore-dangle
  return '_hash' in (editor.schema.nodes[typeName].spec.attrs ?? {})
}

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

  it('skips inline images but still hashes block images', async () => {
    const inlineEditor = await createEditor({ extensions: [Image.configure({ inline: true })] })
    const blockEditor = await createEditor({ extensions: [Image.configure({ inline: false })] })

    expect(hasHashAttribute(inlineEditor, 'image')).toBe(false)
    expect(hasHashAttribute(blockEditor, 'image')).toBe(true)

    inlineEditor.destroy()
    blockEditor.destroy()
  })

  it('skips inline nodes that are not grouped inline', async () => {
    const editor = await createEditor({ extensions: [InlineNodeWithCustomGroup] })

    expect(editor.schema.nodes.inlineNodeWithCustomGroup.isInline).toBe(true)
    expect(hasHashAttribute(editor, 'inlineNodeWithCustomGroup')).toBe(false)

    editor.destroy()
  })

  it('creates the editor when a node reads the editor in inline', async () => {
    const editor = await createEditor({ extensions: [NodeReadingEditorInInline] })

    expect(editor.schema.nodes.nodeReadingEditorInInline.isInline).toBe(true)

    editor.destroy()
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
