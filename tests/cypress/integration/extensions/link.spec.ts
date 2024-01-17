import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

/**
 * Most link tests should actually exist in the demo/ app folder
 */
describe('extension-link', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }
  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  it('does not output src tag for javascript schema', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Link,
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'hello world!',
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      // We have to disable the eslint rule here because we're trying to purposely test eval urls
                      // eslint-disable-next-line no-script-url
                      href: 'javascript:alert(window.origin)',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    // eslint-disable-next-line no-script-url
    expect(editor.getHTML()).to.not.include('javascript:alert(window.origin)')

    editor?.destroy()
    getEditorEl()?.remove()
  })
})
