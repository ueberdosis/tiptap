import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it, vi } from 'vite-plus/test'

import { Editor } from '../Editor.js'

describe('cut command', () => {
  const createEditor = () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    return new Editor({
      element,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello world</p>',
    })
  }

  it('cuts content to start of document', () => {
    const editor = createEditor()

    editor.commands.cut({ from: 7, to: 12 }, 1)

    expect(editor.getHTML()).toBe('<p>worldHello </p>')

    editor.destroy()
  })

  it('cuts content to end of document', () => {
    const editor = createEditor()

    editor.commands.cut({ from: 1, to: 6 }, editor.state.doc.nodeSize - 2)

    expect(editor.getHTML()).toBe('<p> world</p><p>Hello</p>')

    editor.destroy()
  })

  it('puts the selection inside a textblock when cutting to position 0', () => {
    const editor = createEditor()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    editor.commands.cut({ from: 7, to: 12 }, 0)

    expect(editor.getHTML()).toBe('<p>world</p><p>Hello </p>')
    expect(editor.state.selection.from).toBe(1)
    expect(editor.state.selection.$from.parent.inlineContent).toBe(true)
    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
    editor.destroy()
  })

  it('puts the selection inside a textblock when cutting to position 1', () => {
    const editor = createEditor()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    editor.commands.cut({ from: 7, to: 12 }, 1)

    expect(editor.state.selection.from).toBe(1)
    expect(editor.state.selection.$from.parent.inlineContent).toBe(true)
    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
    editor.destroy()
  })
})
