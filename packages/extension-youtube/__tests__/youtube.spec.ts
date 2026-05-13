import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Youtube from '@tiptap/extension-youtube'
import { describe, expect, it } from 'vitest'

import { getAttributesFromYoutubeEmbedUrl, getEmbedUrlFromYoutubeUrl } from '../src/utils.ts'

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

  describe('YouTube Shorts URL handling', () => {
    it('generates correct embed URL for YouTube Shorts with rel parameter', () => {
      const result = getEmbedUrlFromYoutubeUrl({
        url: 'https://www.youtube.com/shorts/EkRHhOCdZjw',
        controls: true,
        rel: 1,
      })

      expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw?rel=1')
    })

    it('generates correct embed URL for YouTube Shorts without www prefix', () => {
      const result = getEmbedUrlFromYoutubeUrl({
        url: 'https://youtube.com/shorts/EkRHhOCdZjw',
        controls: true,
        autoplay: true,
      })

      expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw?autoplay=1')
    })

    it('generates correct embed URL for YouTube Shorts with multiple parameters', () => {
      const result = getEmbedUrlFromYoutubeUrl({
        url: 'https://www.youtube.com/shorts/EkRHhOCdZjw',
        autoplay: true,
        controls: false,
        rel: 0,
      })

      expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw?autoplay=1&controls=0&rel=0')
    })

    it('generates correct embed URL for YouTube Shorts with nocookie option', () => {
      const result = getEmbedUrlFromYoutubeUrl({
        url: 'https://www.youtube.com/shorts/EkRHhOCdZjw',
        nocookie: true,
        controls: true,
        rel: 1,
      })

      expect(result).toBe('https://www.youtube-nocookie.com/embed/EkRHhOCdZjw?rel=1')
    })

    it('generates correct embed URL for YouTube Shorts without extra parameters', () => {
      const result = getEmbedUrlFromYoutubeUrl({
        url: 'https://www.youtube.com/shorts/EkRHhOCdZjw',
        controls: true,
      })

      expect(result).toBe('https://www.youtube.com/embed/EkRHhOCdZjw')
    })
  })

  describe('YouTube Playlist URL handling', () => {
    it('generates correct embed URL for playlist with additional parameters using & separator', () => {
      const result = getEmbedUrlFromYoutubeUrl({
        url: 'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
        controls: true,
        autoplay: true,
      })

      // Playlist URLs use ?list= in base URL, so additional params should use &
      expect(result).toBe(
        'https://www.youtube-nocookie.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf&autoplay=1',
      )
    })
  })

  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 42],
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

  it.each([
    'https://www.youtube.com/embed/',
    'https://www.youtube.com/embed/videoseries',
    'https://example.com/embed/dQw4w9WgXcQ',
  ])('returns null for unsupported youtube embed urls: %s', embedUrl => {
    expect(getAttributesFromYoutubeEmbedUrl(embedUrl)).toBeNull()
  })
})
