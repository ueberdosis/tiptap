import { Editor } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import Youtube from '@dibdab/extension-youtube'
import { describe, expect, it } from 'vitest'

import { getEmbedUrlFromYoutubeUrl } from '../src/utils.ts'

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
})
