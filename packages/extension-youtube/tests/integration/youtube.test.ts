import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Youtube from '@tiptap/extension-youtube'
import { describe, expect, it } from 'vite-plus/test'

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
    // We have to disable the oxlint rule here because we're trying to purposely test eval urls
    // oxlint-disable-next-line no-script-url
    'javascript:alert(window.origin)//embed/',
    'https://youtube.google.com/embed/fdsafsdf',
    'https://youtube.com.bad/embed',
    'https://www.youtu0be/embed',
  ]

  invalidUrls.forEach(url => {
    it(`does not output html for javascript schema or non-youtube links for url ${url}`, () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
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

      expect(editor.getHTML()).not.toContain(url)

      editor?.destroy()
      getEditorEl()?.remove()
    })
  })

  it('when nocookie youtube url is passed, still outputs html with iframe with the url', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, Youtube],
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

    expect(editor.getHTML()).toContain('https://www.youtube-nocookie.com/embed/testvideoid')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it.each([
    [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      42,
    ],
    ['https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0],
    [
      'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
      'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
      0,
    ],
  ])(
    'preserves canonical youtube attrs when content is loaded back from rendered HTML for %s',
    (originalSrc, expectedSrc, start) => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
        content: {
          type: 'doc',
          content: [
            {
              type: 'youtube',
              attrs: {
                src: originalSrc,
                start,
                width: 720,
                height: 405,
              },
            },
          ],
        },
      })

      const html = editor.getHTML()

      editor.destroy()
      getEditorEl()?.remove()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
        content: html,
      })

      expect(editor.getJSON()).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'youtube',
            attrs: {
              src: expectedSrc,
              start,
              width: 720,
              height: 405,
            },
          },
        ],
      })

      editor?.destroy()
      getEditorEl()?.remove()
    },
  )

  describe('iframe dimension handling', () => {
    it('preserves percentage width and height when parsing HTML', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
        content:
          '<div data-youtube-video><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="100%" height="56.25%"></iframe></div>',
      })

      const attrs = editor.getJSON().content?.[0]?.attrs ?? {}

      expect(attrs.width).toBe('100%')
      expect(attrs.height).toBe('56.25%')

      editor?.destroy()
      getEditorEl()?.remove()
    })

    it('keeps percentage dimensions when content is loaded back from rendered HTML', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
        content: {
          type: 'doc',
          content: [
            {
              type: 'youtube',
              attrs: {
                src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                width: '100%',
                height: 480,
              },
            },
          ],
        },
      })

      const html = editor.getHTML()

      expect(html).toContain('width="100%"')

      editor.destroy()
      getEditorEl()?.remove()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
        content: html,
      })

      const attrs = editor.getJSON().content?.[0]?.attrs ?? {}

      expect(attrs.width).toBe('100%')
      expect(attrs.height).toBe(480)

      editor?.destroy()
      getEditorEl()?.remove()
    })

    it('still parses plain numeric dimensions as numbers', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
        content:
          '<div data-youtube-video><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="720" height="405"></iframe></div>',
      })

      const attrs = editor.getJSON().content?.[0]?.attrs ?? {}

      expect(attrs.width).toBe(720)
      expect(attrs.height).toBe(405)

      editor?.destroy()
      getEditorEl()?.remove()
    })

    it.each([
      ['100px', '200px'],
      ['20rem', '10em'],
      ['50vw', '30vh'],
    ])('preserves unit-based dimensions like %s when parsing HTML', (width, height) => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
        content: `<div data-youtube-video><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="${width}" height="${height}"></iframe></div>`,
      })

      const attrs = editor.getJSON().content?.[0]?.attrs ?? {}

      expect(attrs.width).toBe(width)
      expect(attrs.height).toBe(height)

      editor?.destroy()
      getEditorEl()?.remove()
    })

    it('preserves non-numeric strings instead of falling back to the default dimensions', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
        content:
          '<div data-youtube-video><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="not-a-size" height="auto"></iframe></div>',
      })

      const attrs = editor.getJSON().content?.[0]?.attrs ?? {}

      expect(attrs.width).toBe('not-a-size')
      expect(attrs.height).toBe('auto')

      editor?.destroy()
      getEditorEl()?.remove()
    })

    it('accepts a percentage width in the setYoutubeVideo command', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
      })

      editor.commands.setYoutubeVideo({
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        width: '100%',
        height: 405,
      })

      const attrs = editor.getJSON().content?.[0]?.attrs ?? {}

      expect(attrs.width).toBe('100%')
      expect(attrs.height).toBe(405)

      editor?.destroy()
      getEditorEl()?.remove()
    })
  })

  it('does not persist NaN width or height when parsing iframe dimensions from HTML', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, Youtube],
      content:
        '<div data-youtube-video><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="100%" height="auto"></iframe></div>',
    })

    const attrs = editor.getJSON().content?.[0]?.attrs ?? {}
    const html = editor.getHTML()

    expect(Number.isNaN(attrs.width)).toBe(false)
    expect(Number.isNaN(attrs.height)).toBe(false)
    expect(html).not.toContain('width="NaN"')
    expect(html).not.toContain('height="NaN"')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  describe('missing src attribute', () => {
    // The `src` attribute is declared with `default: null` and its `parseHTML` returns
    // `undefined` when the iframe carries no `src`, so a node with a null `src` is a
    // legitimate parse result rather than a malformed document.
    const iframeWithoutSrc =
      '<div data-youtube-video=""><iframe class="w-full aspect-video" width="640" height="480" allowfullscreen="true" start="0"></iframe></div>'

    it('refuses setYoutubeVideo with a missing src instead of throwing', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Youtube],
      })

      expect(editor.commands.setYoutubeVideo({ src: null as unknown as string })).toBe(false)

      editor?.destroy()
      getEditorEl()?.remove()
    })

    it('parses an iframe without a src attribute without throwing', () => {
      expect(() => {
        editor = new Editor({
          element: createEditorEl(),
          extensions: [Document, Text, Paragraph, Youtube],
          content: iframeWithoutSrc,
        })
      }).not.toThrow()

      expect(editor?.getHTML()).not.toContain('src=')

      editor?.destroy()
      getEditorEl()?.remove()
    })
  })
})
