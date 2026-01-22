import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import TextAlign from '@dibdab/extension-text-align'
import { generateJSON } from '@dibdab/html'
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
})
