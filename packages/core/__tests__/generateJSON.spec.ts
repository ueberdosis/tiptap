import { generateJSON } from '@tiptap/core'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
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
})
