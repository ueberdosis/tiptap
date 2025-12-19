import { Editor } from '@tiptap/core'
import Audio from '@tiptap/extension-audio'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

describe('extension-audio', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }

  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  const destroyEditor = () => {
    editor?.destroy()
    editor = null
    getEditorEl()?.remove()
  }

  it('does not output html for javascript schema or invalid links', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, Audio],
      content: {
        type: 'doc',
        content: [
          {
            type: 'audio',
            attrs: {
              // We want to ensure script URLs are filtered out
              // eslint-disable-next-line no-script-url
              src: 'javascript:alert(window.origin)//audio',
            },
          },
        ],
      },
    })

    // eslint-disable-next-line no-script-url
    expect(editor.getHTML()).not.toContain('javascript:alert')

    destroyEditor()
  })

  it('allows base64 sources only when enabled', () => {
    const dataUrl = 'data:audio/mp3;base64,aGVsbG8='

    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, Audio],
      content: {
        type: 'doc',
        content: [
          {
            type: 'audio',
            attrs: {
              src: dataUrl,
            },
          },
        ],
      },
    })

    expect(editor.getHTML()).not.toContain(dataUrl)

    destroyEditor()

    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, Audio.configure({ allowBase64: true })],
      content: {
        type: 'doc',
        content: [
          {
            type: 'audio',
            attrs: {
              src: dataUrl,
            },
          },
        ],
      },
    })

    expect(editor.getHTML()).toContain(dataUrl)

    destroyEditor()
  })

  it('respects audio attributes and options', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        Audio.configure({
          autoplay: true,
          controls: false,
          loop: true,
          muted: true,
          preload: 'auto',
          controlslist: 'nodownload',
          crossorigin: 'anonymous',
          disableRemotePlayback: true,
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'audio',
            attrs: {
              src: 'https://assets.tiptap.dev/sounds/loop.mp3',
              controls: true,
              preload: 'none',
            },
          },
        ],
      },
    })

    const html = editor.getHTML()

    expect(html).toContain('<audio')
    expect(html).toContain('src="https://assets.tiptap.dev/sounds/loop.mp3"')
    expect(html).toContain('autoplay')
    expect(html).toContain('loop')
    expect(html).toContain('muted')
    expect(html).toContain('controlslist="nodownload"')
    expect(html).toContain('crossorigin="anonymous"')
    expect(html).toContain('disableremoteplayback')
    expect(html).toContain('preload="none"')
    expect(html).toContain('controls')

    destroyEditor()
  })

  it('does not insert invalid audio sources via command', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Text, Paragraph, Audio],
    })

    const succeeded = editor.commands.setAudio({
      // We want to ensure script URLs are filtered out
      // eslint-disable-next-line no-script-url
      src: 'javascript:alert(1)',
    })

    expect(succeeded).toBe(false)
    // eslint-disable-next-line no-script-url
    expect(editor.getHTML()).not.toContain('javascript:alert')

    const validInsert = editor.commands.setAudio({
      src: 'https://assets.tiptap.dev/sounds/loop.mp3',
      loop: true,
      muted: true,
      disableremoteplayback: true,
      controls: false,
    })

    expect(validInsert).toBe(true)

    const html = editor.getHTML()

    expect(html).toContain('src="https://assets.tiptap.dev/sounds/loop.mp3"')
    expect(html).toContain('loop')
    expect(html).toContain('muted')
    expect(html).toContain('disableremoteplayback')
    expect(html).not.toContain('controls')

    destroyEditor()
  })
})
