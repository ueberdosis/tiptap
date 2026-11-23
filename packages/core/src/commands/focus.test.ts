import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Plugin } from '@tiptap/pm/state'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

import { Editor } from '../Editor.js'
import { Extension } from '../Extension.js'

const platform = vi.hoisted(() => ({ iOS: false, safari: false }))

vi.mock('../utilities/isiOS.js', () => ({ isiOS: () => platform.iOS }))
vi.mock('../utilities/isSafari.js', () => ({ isSafari: () => platform.safari }))

// Appends a paragraph on the next transaction, like the TrailingNode extension
const AppendParagraph = Extension.create({
  name: 'appendParagraph',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (_, __, state) => {
          if (state.doc.lastChild?.type.name === 'paragraph') {
            return
          }

          return state.tr.insert(state.doc.content.size, state.schema.nodes.paragraph.create())
        },
      }),
    ]
  },
})

describe('focus', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, Blockquote, AppendParagraph],
      content: '<blockquote><p>hello</p></blockquote>',
    })
  })

  afterEach(() => {
    editor.destroy()
    platform.iOS = false
    platform.safari = false
  })

  describe.each([
    ['iOS', { iOS: true, safari: false }],
    ['desktop Safari', { iOS: false, safari: true }],
  ])('on %s', (_, flags) => {
    beforeEach(() => {
      Object.assign(platform, flags)
    })

    it('does not throw when focusing changes the document', async () => {
      expect(() => editor.commands.focus('end')).not.toThrow()

      await Promise.resolve()

      expect(editor.view.hasFocus()).toBe(true)
      expect(editor.getHTML()).toBe('<blockquote><p>hello</p></blockquote><p></p>')
    })

    it('does not throw in a chain that edits after focusing', async () => {
      expect(() => editor.chain().focus('end').insertContent('!').run()).not.toThrow()

      await Promise.resolve()

      expect(editor.view.hasFocus()).toBe(true)
      expect(editor.getHTML()).toBe('<blockquote><p>hello!</p></blockquote><p></p>')
    })
  })
})
