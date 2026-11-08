import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { renderToHTMLString } from '../../src/pm/html-string/html-string.js'

describe('static HTML attribute security', () => {
  it('removes event handlers supplied by JSON through an extension', () => {
    const image = Image.extend({
      addAttributes() {
        return { ...this.parent?.(), onerror: { default: null } }
      },
    })
    const html = renderToHTMLString({
      extensions: [Document, Paragraph, Text, image],
      content: {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: {
              src: '/missing.png',
              alt: 'Safe image',
              onerror: 'alert(document.cookie)',
              title: '"><svg onload=alert(1)>',
            },
          },
        ],
      },
    })
    const container = document.createElement('div')
    container.innerHTML = html
    const element = container.querySelector('img')

    expect(element).not.toBeNull()
    expect(element?.getAttribute('onerror')).toBeNull()
    expect(element?.getAttribute('src')).toBe('/missing.png')
    expect(element?.getAttribute('alt')).toBe('Safe image')
    expect(element?.getAttribute('title')).toBe('"><svg onload=alert(1)>')
    expect(container.children).toHaveLength(1)
    expect(container.querySelector('svg')).toBeNull()
  })
})
