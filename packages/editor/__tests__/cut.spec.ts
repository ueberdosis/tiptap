import { Editor } from '@tiptap/editor'
import { Document } from '@tiptap/editor/extensions/document'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
import { describe, expect, it } from 'vite-plus/test'

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
})
