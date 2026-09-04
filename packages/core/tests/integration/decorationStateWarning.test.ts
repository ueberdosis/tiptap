import { Editor, Extension } from '@tiptap/core'
import type { DecorationSpec } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

function createEditor(spec: DecorationSpec) {
  const extension = Extension.create({
    name: 'probe',
    addDecorations() {
      return spec
    },
  })

  return new Editor({
    extensions: [Document, Paragraph, Text, extension],
    content: '<p>hello world</p>',
  })
}

describe('stale editor.state warning', () => {
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('warns only once per editor, not once per transaction', () => {
    const editor = createEditor({
      create: ({ editor: instance }) => {
        void instance.state
        return []
      },
    })

    warn.mockClear()
    editor.commands.insertContent('a')
    editor.commands.insertContent('b')
    editor.commands.insertContent('c')

    expect(warn).toHaveBeenCalledTimes(1)

    editor.destroy()
  })

  it('stays silent in production builds', async () => {
    // `isDev` is read once at module load, so the module needs a fresh import
    // with the production env in place.
    vi.stubEnv('NODE_ENV', 'production')
    vi.resetModules()

    try {
      const { Editor: ProductionEditor, Extension: ProductionExtension } =
        await import('@tiptap/core')

      const probe = ProductionExtension.create({
        name: 'probe',
        addDecorations: () => ({
          create: ({ editor: instance }) => {
            void instance.state
            return []
          },
        }),
      })

      const editor = new ProductionEditor({
        extensions: [Document, Paragraph, Text, probe],
        content: '<p>hello world</p>',
      })

      warn.mockClear()
      editor.commands.insertContent('x')

      expect(warn).not.toHaveBeenCalled()

      editor.destroy()
    } finally {
      vi.unstubAllEnvs()
      vi.resetModules()
    }
  })

  it('does not warn for reads outside the apply window', () => {
    const editor = createEditor({ create: () => [] })

    warn.mockClear()
    editor.commands.insertContent('x')
    void editor.state

    expect(warn).not.toHaveBeenCalled()

    editor.destroy()
  })
})
