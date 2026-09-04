import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vite-plus/test'

import { generateHTML, generateJSON } from '../../src/server/index.js'

describe('server exports with jsdom/happy-dom environment (issue #6951)', () => {
  it('should have global window defined (test environment check)', () => {
    expect(typeof window).toBe('object')
    expect(window).toBeDefined()
  })

  it('generateJSON should work even when global window is defined', () => {
    const html = '<p>Hello, world!</p>'
    const extensions = [Document, Paragraph, Text]

    const json = generateJSON(html, extensions)

    expect(json).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello, world!',
            },
          ],
        },
      ],
    })
  })

  it('generateHTML should work even when global window is defined', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello, world!',
            },
          ],
        },
      ],
    }
    const extensions = [Document, Paragraph, Text]

    // This should NOT throw "generateHTML can only be used in a Node environment"
    const html = generateHTML(json, extensions)

    expect(html).toBe('<p>Hello, world!</p>')
  })
})
