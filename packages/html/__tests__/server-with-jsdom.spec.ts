/**
 * This test verifies that the server exports work correctly in Node.js
 * test environments that use jsdom/happy-dom (which polyfill the global window).
 *
 * This is a regression test for https://github.com/ueberdosis/tiptap/issues/6951
 */
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

// Import directly from server to bypass vitest aliases
// This simulates what happens when Node.js resolves @tiptap/html via conditional exports
import { generateHTML, generateJSON } from '../src/server/index.js'

describe('server exports with jsdom/happy-dom environment (issue #6951)', () => {
  // Verify we're actually running with a global window (simulating jsdom)
  it('should have global window defined (test environment check)', () => {
    expect(typeof window).toBe('object')
    expect(window).toBeDefined()
  })

  it('generateJSON should work even when global window is defined', () => {
    const html = '<p>Hello, world!</p>'
    const extensions = [Document, Paragraph, Text]

    // This should NOT throw "generateJSON can only be used in a Node environment"
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

    expect(html).toBe('<p xmlns="http://www.w3.org/1999/xhtml">Hello, world!</p>')
  })
})
