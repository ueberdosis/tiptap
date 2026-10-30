import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from '../Editor.js'
import { Mark } from '../Mark.js'
import { Node } from '../Node.js'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
})

const Tint = Mark.create({
  name: 'tint',
  addAttributes: () => ({
    color: {
      default: null,
      parseHTML: el => (el as HTMLElement).getAttribute('data-color'),
      renderHTML: attrs => ({ 'data-color': attrs.color }),
    },
  }),
  parseHTML: () => [{ tag: 'span[data-color]' }],
  renderHTML: ({ HTMLAttributes }) => ['span', HTMLAttributes, 0],
})

describe('updateAttributes command', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('updates a mark when the selection starts inside the marked text', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Tint],
      content: '<p><span data-color="blue">Hello world</span></p>',
    })

    editor.commands.setTextSelection({ from: 7, to: 12 }) // "world"
    const ok = editor.commands.updateAttributes('tint', { color: 'red' })

    expect(ok).toBe(true)
    expect(editor.getHTML()).toBe(
      '<p><span data-color="blue">Hello </span><span data-color="red">world</span></p>',
    )
  })

  it('still updates a mark when the selection starts at the mark run', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Tint],
      content: '<p><span data-color="blue">Hello world</span></p>',
    })

    editor.commands.setTextSelection({ from: 1, to: 6 }) // "Hello"
    const ok = editor.commands.updateAttributes('tint', { color: 'red' })

    expect(ok).toBe(true)
    expect(editor.getHTML()).toBe(
      '<p><span data-color="red">Hello</span><span data-color="blue"> world</span></p>',
    )
  })
})
