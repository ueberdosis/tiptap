import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import { generateJSON } from '@tiptap/html'
import { describe, expect, it } from 'vitest'

describe('generateJSON', () => {
  it('generate JSON from HTML without an editor instance', () => {
    const html = '<p>Example Text</p>'

    const json = generateJSON(html, [Document, Paragraph, Text])

    expect(JSON.stringify(json)).toBe(
      JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Example Text',
              },
            ],
          },
        ],
      }),
    )
  })

  // issue: https://github.com/ueberdosis/tiptap/issues/1601
  it('generate JSON with style attributes', () => {
    const html = '<p style="text-align: center;">Example Text</p>'

    const json = generateJSON(html, [Document, Paragraph, Text, TextAlign.configure({ types: ['paragraph'] })])

    expect(JSON.stringify(json)).toBe(
      JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: {
              textAlign: 'center',
            },
            content: [
              {
                type: 'text',
                text: 'Example Text',
              },
            ],
          },
        ],
      }),
    )
  })

  // issue: https://github.com/ueberdosis/tiptap/issues/6968
  it('should not crash when HTML contains link, script, or style tags with resource references', () => {
    const html = `
      <link rel="stylesheet" href="/assets/app.css">
      <link rel="preload" href="/assets/app.js" as="script">
      <script src="/assets/app.js"></script>
      <style>body { color: red; }</style>
      <p>Content after resource tags</p>
    `

    // This should not throw "TypeError: Invalid URL (ERR_INVALID_URL)"
    const json = generateJSON(html, [Document, Paragraph, Text])

    expect(json.type).toBe('doc')
    expect(json.content).toBeDefined()
    // The paragraph content should be parsed correctly
    expect(json.content.some((node: any) => node.type === 'paragraph')).toBe(true)
  })
})
