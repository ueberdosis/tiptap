import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

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
      extensions: [
        Document,
        Text,
        Paragraph,
        HorizontalRule,
        Image,
      ],
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

    expect(editor.getHTML()).to.match(
      /<img(.*?)><hr><p>Example Text<\/p>/,
    )

    editor?.destroy()
    getEditorEl()?.remove()
  })
})
