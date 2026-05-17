import { generateHTML } from '@tiptap/core'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { describe, expect, it } from 'vitest'

describe('generateHTML', () => {
  it('generate HTML from JSON without an editor instance', () => {
    const json = {
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
    }

    const html = generateHTML(json, [Document, Paragraph, Text])

    expect(html).toBe('<p>Example Text</p>')
  })
})
