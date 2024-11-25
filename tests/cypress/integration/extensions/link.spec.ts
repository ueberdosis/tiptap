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

  const validUrls = [
    'https://example.com',
    'http://example.com',
    '/same-site/index.html',
    '../relative.html',
    'mailto:info@example.com',
    'ftp://info@example.com',
  ]

  it('does output href tag for valid JSON schemas', () => {
    validUrls.forEach(url => {
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
                        href: url,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      })

      expect(editor.getHTML()).to.include(url)
      expect(JSON.stringify(editor.getJSON())).to.include(url)

      editor?.destroy()
      getEditorEl()?.remove()
    })
  })

  it('does output href tag for valid HTML schemas', () => {
    validUrls.forEach(url => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          Link,
        ],
        content: `<p><a href="${url}">hello world!</a></p>`,
      })

      expect(editor.getHTML()).to.include(url)
      expect(JSON.stringify(editor.getJSON())).to.include(url)

      editor?.destroy()
      getEditorEl()?.remove()
    })
  })

  // We have to disable the eslint rule here because we're trying to purposely test eval urls
  // Examples inspired by: https://portswigger.net/web-security/cross-site-scripting/cheat-sheet#protocols
  const invalidUrls = [
    // A standard JavaScript protocol
    // eslint-disable-next-line no-script-url
    'javascript:alert(window.origin)',

    // The protocol is not case sensitive
    // eslint-disable-next-line no-script-url
    'jAvAsCrIpT:alert(window.origin)',

    // Characters \x01-\x20 are allowed before the protocol
    // eslint-disable-next-line no-script-url
    '\x00javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x01javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x02javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x03javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x04javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x05javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x06javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x07javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x08javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x09javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x0ajavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x0bjavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x0cjavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x0djavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x0ejavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x0fjavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x10javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x11javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x12javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x13javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x14javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x15javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x16javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x17javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x18javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x19javascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x1ajavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x1bjavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x1cjavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x1djavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x1ejavascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    '\x1fjavascript:alert(window.origin)',

    // Characters \x09,\x0a,\x0d are allowed inside the protocol
    // eslint-disable-next-line no-script-url
    'java\x09script:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    'java\x0ascript:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    'java\x0dscript:alert(window.origin)',

    // Characters \x09,\x0a,\x0d are allowed after protocol name before the colon
    // eslint-disable-next-line no-script-url
    'javascript\x09:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    'javascript\x0a:alert(window.origin)',
    // eslint-disable-next-line no-script-url
    'javascript\x0d:alert(window.origin)',
  ]

  it('does not output href for :javascript links in JSON schema', () => {
    invalidUrls.forEach(url => {
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
                        href: url,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      })

      expect(editor.getHTML()).to.not.include(url)
      // Unfortunately, if the content is provided as JSON, it stays in the editor instance until it's destroyed
      // At least, it cannot be outputted as HTML into a page
      // expect(JSON.stringify(editor.getJSON())).to.not.include(url)

      editor?.destroy()
      getEditorEl()?.remove()
    })
  })

  it('does not output href for :javascript links in HTML schema', () => {
    invalidUrls.forEach(url => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          Link,
        ],
        content: `<p><a href="${url}">hello world!</a></p>`,
      })

      expect(editor.getHTML()).to.not.include(url)
      expect(JSON.stringify(editor.getJSON())).to.not.include(url)

      editor?.destroy()
      getEditorEl()?.remove()
    })
  })

  describe('custom protocols', () => {
    it('allows using additional custom protocols', () => {
      ['custom://test.css', 'another-custom://protocol.html', ...validUrls].forEach(url => {
        editor = new Editor({
          element: createEditorEl(),
          extensions: [
            Document,
            Text,
            Paragraph,
            Link.configure({
              protocols: ['custom', { scheme: 'another-custom' }],
            }),
          ],
          content: `<p><a href="${url}">hello world!</a></p>`,
        })

        expect(editor.getHTML()).to.include(url)
        expect(JSON.stringify(editor.getJSON())).to.include(url)

        editor?.destroy()
        getEditorEl()?.remove()
      })
    })
  })
})
