import { createRequire } from 'node:module'

import { Editor, createNodeFromContent } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

// Put @tiptap/core on the CJS build and the rest of ProseMirror on the ESM one
vi.mock('@tiptap/pm/model', () => {
  const require = createRequire(import.meta.url)

  return { ...require('prosemirror-model') }
})

// Same version, but a different module instance than the one core now uses.
const otherCopy = await vi.importActual<typeof import('@tiptap/pm/model')>('@tiptap/pm/model')

const IMAGE = {
  type: 'image',
  attrs: { src: 'https://example.com/a.png', alt: 'a', title: 'a' },
}

describe('duplicated prosemirror-model', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  const createEditor = (content = '<p></p>') =>
    new Editor({ extensions: [Document, Paragraph, Text, Image], content })

  const otherCopyFragment = (text: string) =>
    otherCopy.Fragment.fromArray([
      editor.schema.nodeFromJSON({ type: 'paragraph', content: [{ type: 'text', text }] }),
    ])

  describe('insertContentAt', () => {
    it('inserts an array of JSON nodes', () => {
      editor = createEditor()

      editor.commands.insertContentAt(0, [IMAGE])

      expect(editor.getHTML()).toContain('src="https://example.com/a.png"')
    })

    it('inserts a fragment built by the other copy while applying rules', () => {
      editor = createEditor('<p>start</p>')

      editor.commands.insertContentAt(0, otherCopyFragment('block'), {
        applyInputRules: true,
        applyPasteRules: true,
      })

      expect(editor.getHTML()).toContain('block')
    })
  })

  describe('insertContent', () => {
    it('inserts HTML', () => {
      editor = createEditor()

      editor.commands.insertContent('<p>inserted</p>')

      expect(editor.getHTML()).toContain('inserted')
    })

    it('inserts a fragment built by the other copy', () => {
      editor = createEditor('<p>start</p>')

      editor.commands.insertContent(otherCopyFragment('block'))

      expect(editor.getHTML()).toContain('block')
    })

    it('inserts a fragment built by the other copy that only holds text', () => {
      editor = createEditor('<p>start</p>')

      editor.commands.insertContent(otherCopy.Fragment.fromArray([editor.schema.text('inline')]))

      expect(editor.getHTML()).toContain('inline')
    })
  })

  describe('setContent', () => {
    it('sets a fragment built by the other copy', () => {
      editor = createEditor('<p>start</p>')

      editor.commands.setContent(otherCopyFragment('replaced'))

      expect(editor.getHTML()).toContain('replaced')
    })

    it('sets a fragment built by our own copy', () => {
      editor = createEditor('<p>start</p>')
      const document = editor.schema.nodeFromJSON({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'replaced' }] }],
      })

      editor.commands.setContent(document.content)

      expect(editor.getHTML()).toContain('replaced')
    })
  })

  describe('createNodeFromContent', () => {
    it('keeps a fragment built by the other copy instead of dropping it', () => {
      editor = createEditor()
      const paragraph = editor.schema.nodeFromJSON({
        type: 'paragraph',
        content: [{ type: 'text', text: 'kept' }],
      })
      const fragment = otherCopy.Fragment.fromArray([paragraph])

      expect(createNodeFromContent(fragment, editor.schema).toJSON()).toEqual(fragment.toJSON())
    })

    it('keeps a node built by the other copy instead of dropping it', () => {
      editor = createEditor()
      const otherSchema = new otherCopy.Schema({
        nodes: {
          doc: { content: 'block+' },
          paragraph: { group: 'block', content: 'inline*' },
          text: { group: 'inline' },
        },
      })
      const node = otherCopy.Node.fromJSON(otherSchema, {
        type: 'paragraph',
        content: [{ type: 'text', text: 'kept' }],
      })

      expect(createNodeFromContent(node, editor.schema).toJSON()).toEqual(node.toJSON())
    })
  })
})
