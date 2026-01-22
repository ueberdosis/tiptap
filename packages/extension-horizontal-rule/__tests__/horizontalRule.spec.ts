import { Editor } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import HorizontalRule from '@dibdab/extension-horizontal-rule'
import Image from '@dibdab/extension-image'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { describe, expect, it } from 'vitest'

describe('extension-horizontal-rule', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)

    return editorEl
  }

  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  it('should be inserted after block leaf nodes correctly', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, HorizontalRule, Image],
      content: {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: {
              src: 'https://source.unsplash.com/8xznAGy4HcY/800x400',
            },
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Example Text',
              },
            ],
          },
        ],
      },
    })

    editor.commands.setTextSelection(2)
    editor.commands.setHorizontalRule()

    expect(editor.getHTML()).toMatch(/<img(.*?)><hr><p>Example Text<\/p>/)

    editor?.destroy()
    getEditorEl()?.remove()
  })
})
