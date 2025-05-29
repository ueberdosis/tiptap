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

  describe('start timestamp', () => {
    const timestamp = 60

    const urls = [
      {
        url: `https://www.youtube.com/watch?v=testvideoid&t=${timestamp}s`,
        expected: `https://www.youtube.com/embed/testvideoid?start=${timestamp}`,
      },
      {
        url: `https://youtu.be/testvideoid?t=${timestamp}`,
        expected: `https://www.youtube.com/embed/testvideoid?start=${timestamp}`,
      },
      {
        url: `https://www.youtube.com/embed/testvideoid?start=${timestamp}`,
        expected: `https://www.youtube.com/embed/testvideoid?start=${timestamp}`,
      },
    ]

    urls.forEach(({ url, expected }) => {
      it(`parses the start timestamp for url ${url}`, () => {
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

        expect(editor.getHTML()).to.include(expected)

        editor?.destroy()
        getEditorEl()?.remove()
      })
    })
  })

  it('parses live url', () => {
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
              src: 'https://www.youtube.com/live/testvideoid',
            },
          },
        ],
      },
    })

    expect(editor.getHTML()).to.include('https://www.youtube.com/embed/testvideoid')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('parses shorts url', () => {
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
              src: 'https://www.youtube.com/shorts/testvideoid',
            },
          },
        ],
      },
    })

    expect(editor.getHTML()).to.include('https://www.youtube.com/embed/testvideoid')

    editor?.destroy()
    getEditorEl()?.remove()
  })
})
