import { Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string'
import { describe, expect, it } from 'vitest'

const Audio = Node.create({
  name: 'audio',
  group: 'block',
  atom: true,
  addAttributes() {
    return { src: { default: null } }
  },
  renderHTML({ HTMLAttributes }) {
    return ['audio', HTMLAttributes]
  },
})

const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  addAttributes() {
    return { src: { default: null } }
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', HTMLAttributes]
  },
})

const extensions = [Document, Paragraph, Text, Audio, Video]

describe('static renderer: non-void elements get a closing tag', () => {
  it('renders <audio> with a closing tag, not self-closed', () => {
    const html = renderToHTMLString({
      content: {
        type: 'doc',
        content: [{ type: 'audio', attrs: { src: 'https://example.com/a.mp3' } }],
      },
      extensions,
    })

    expect(html).toBe('<audio src="https://example.com/a.mp3"></audio>')
  })

  it('renders <video> with a closing tag, not self-closed', () => {
    const html = renderToHTMLString({
      content: {
        type: 'doc',
        content: [{ type: 'video', attrs: { src: 'https://example.com/v.mp4' } }],
      },
      extensions,
    })

    expect(html).toBe('<video src="https://example.com/v.mp4"></video>')
  })
})
