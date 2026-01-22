import { Editor } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import Twitch from '@dibdab/extension-twitch'
import { describe, expect, it } from 'vitest'

/**
 * Most Twitch tests should actually exist in the demo/ app folder
 */
describe('extension-twitch', () => {
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
    'https://twitch.google.com/videos/1234567890',
    'https://twitch.com.bad/videos/1234567890',
    'https://www.twtich.tv/videos/1234567890',
  ]

  invalidUrls.forEach(url => {
    it(`does not output html for javascript schema or non-twitch links for url ${url}`, () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, Twitch],
        content: {
          type: 'doc',
          content: [
            {
              type: 'twitch',
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

  it('outputs html with iframe for valid twitch video id', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://www.twitch.tv/videos/1234567890',
            },
          },
        ],
      },
    })

    expect(editor.getHTML()).toContain('player.twitch.tv')
    expect(editor.getHTML()).toContain('1234567890')
    expect(editor.getHTML()).toContain('example.com')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('outputs html with iframe for twitch clip url', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://clips.twitch.tv/ExampleClipName-ABC123',
            },
          },
        ],
      },
    })

    expect(editor.getHTML()).toContain('clips.twitch.tv/embed')
    expect(editor.getHTML()).toContain('ExampleClipName-ABC123')
    expect(editor.getHTML()).toContain('example.com')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('outputs html with iframe for twitch channel url', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://www.twitch.tv/examplechannel',
            },
          },
        ],
      },
    })

    expect(editor.getHTML()).toContain('player.twitch.tv')
    expect(editor.getHTML()).toContain('examplechannel')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('respects allowFullscreen option', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
          allowFullscreen: true,
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://www.twitch.tv/videos/1234567890',
            },
          },
        ],
      },
    })

    const html = editor.getHTML()
    expect(html).toContain('allowfullscreen="true"')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('respects custom width and height', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
          width: 800,
          height: 600,
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://www.twitch.tv/videos/1234567890',
              width: 800,
              height: 600,
            },
          },
        ],
      },
    })

    const html = editor.getHTML()
    expect(html).toContain('width="800"')
    expect(html).toContain('height="600"')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('can insert a video using the setTwitchVideo command', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
        }),
      ],
    })

    editor.commands.setTwitchVideo({
      src: 'https://www.twitch.tv/videos/1234567890',
    })

    expect(editor.getHTML()).toContain('data-twitch-video')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('does not insert video with invalid URL using setTwitchVideo command', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, Twitch],
    })

    const result = editor.commands.setTwitchVideo({
      src: 'https://invalid.com/video',
    })

    expect(result).toBe(false)

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('handles video URL with search parameters', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://www.twitch.tv/videos/1234567890?filter=archives&sort=time',
            },
          },
        ],
      },
    })

    expect(editor.getHTML()).toContain('player.twitch.tv')
    expect(editor.getHTML()).toContain('1234567890')
    expect(editor.getHTML()).not.toContain('filter=archives')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('handles clip URL with search parameters', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://clips.twitch.tv/ExampleClipName-ABC123?foo=bar&baz=qux',
            },
          },
        ],
      },
    })

    expect(editor.getHTML()).toContain('clips.twitch.tv/embed')
    expect(editor.getHTML()).toContain('ExampleClipName-ABC123')
    expect(editor.getHTML()).not.toContain('foo=bar')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('respects muted option', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
          muted: true,
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://www.twitch.tv/videos/1234567890',
            },
          },
        ],
      },
    })

    const html = editor.getHTML()
    expect(html).toContain('muted=true')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('respects time option for videos', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
          time: '1h2m3s',
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://www.twitch.tv/videos/1234567890',
            },
          },
        ],
      },
    })

    const html = editor.getHTML()
    expect(html).toContain('time=1h2m3s')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('respects attribute overrides for autoplay', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
          autoplay: true,
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://www.twitch.tv/videos/1234567890',
              autoplay: false,
            },
          },
        ],
      },
    })

    const html = editor.getHTML()
    // Should NOT have autoplay=true since attribute overrides option
    expect(html).not.toContain('autoplay=true')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('respects attribute overrides for muted', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
          muted: false,
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://www.twitch.tv/videos/1234567890',
              muted: true,
            },
          },
        ],
      },
    })

    const html = editor.getHTML()
    expect(html).toContain('muted=true')

    editor?.destroy()
    getEditorEl()?.remove()
  })

  it('respects attribute overrides for time', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Twitch.configure({
          parent: 'example.com',
          time: '1h0m0s',
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'twitch',
            attrs: {
              src: 'https://www.twitch.tv/videos/1234567890',
              time: '2h30m15s',
            },
          },
        ],
      },
    })

    const html = editor.getHTML()
    expect(html).toContain('time=2h30m15s')
    expect(html).not.toContain('1h0m0s')

    editor?.destroy()
    getEditorEl()?.remove()
  })
})
