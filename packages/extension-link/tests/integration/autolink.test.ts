import type { JSONContent } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

describe('extension-link autolink', () => {
  let editor: Editor | null = null

  const createEditor = (content: string) => {
    const editorEl = document.createElement('div')

    document.body.appendChild(editorEl)
    editor = new Editor({
      element: editorEl,
      extensions: [Document, Text, Paragraph, Link],
      content,
    })
    return editor
  }

  const type = (text: string) => {
    if (!editor) {
      throw new Error('No editor')
    }
    // Insert character by character to simulate typing
    text.split('').forEach(character => {
      editor?.view.dispatch(editor.state.tr.insertText(character))
    })
  }

  const paragraphContent = (): JSONContent[] => editor?.getJSON().content?.[0].content ?? []

  afterEach(() => {
    editor?.destroy()
    editor = null
    document.body.innerHTML = ''
  })

  it('does not extend an existing link when typing a space after it', () => {
    createEditor('<p><a href="https://example.com">https://example.com</a></p>')
    editor!.commands.setTextSelection(editor!.state.doc.content.size - 1)

    type(' hello')

    expect(paragraphContent()).toEqual([
      {
        type: 'text',
        text: 'https://example.com',
        marks: [expect.objectContaining({ type: 'link' })],
      },
      { type: 'text', text: ' hello' },
    ])
  })

  it('links a typed url after a space without linking the space', () => {
    createEditor('<p></p>')

    type('https://example.com next')

    expect(paragraphContent()).toEqual([
      {
        type: 'text',
        text: 'https://example.com',
        marks: [expect.objectContaining({ type: 'link' })],
      },
      { type: 'text', text: ' next' },
    ])
  })

  it('keeps a link intact when typing a space inside its text', () => {
    createEditor('<p><a href="https://tiptap.dev">click here</a></p>')
    // Position the cursor after "click"
    editor!.commands.setTextSelection(6)

    type(' ')

    expect(paragraphContent()).toEqual([
      {
        type: 'text',
        text: 'click  here',
        marks: [expect.objectContaining({ type: 'link' })],
      },
    ])
  })
})
