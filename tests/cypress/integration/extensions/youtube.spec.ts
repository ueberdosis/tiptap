import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Youtube from '@tiptap/extension-youtube'

/**
 * Most youtube tests should actually exist in the demo/ app folder
 */
describe('extension-youtube', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }
  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  const invalidUrls = [
    // We have to disable the eslint rule here because we're trying to purposely test eval urls
    // eslint-disable-next-line no-script-url
    'javascript:alert(window.origin)//embed/',
    'https://youtube.google.com/embed/fdsafsdf',
    'https://youtube.com.bad/embed',
  ]

  invalidUrls.forEach(url => {
    it(`does not output html for javascript schema or non-youtube links for url ${url}`, () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          Youtube,
        ],
        content: {
          type: 'doc',
          content: [
            {
              type: 'youtube',
              attrs: {
                src: url,
              },
            },
          ],
        },
      })

      expect(editor.getHTML()).to.not.include(url)

      editor?.destroy()
      getEditorEl()?.remove()
    })
  })

  it('when nocookie youtube url is passed, still outputs html with iframe with the url', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Youtube,
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'youtube',
            attrs: {
              src: 'https://www.youtube-nocookie.com/embed/testvideoid',
            },
          },
        ],
      },
    })

    expect(editor.getHTML()).to.include('https://www.youtube-nocookie.com/embed/testvideoid')

    editor?.destroy()
    getEditorEl()?.remove()
  })
})
