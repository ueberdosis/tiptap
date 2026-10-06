import { generateHTML, type JSONContent } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, test } from 'vite-plus/test'

import { Highlight } from './highlight.js'

const renderHighlight = (color: string) => {
  const content: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Example',
            marks: [{ type: 'highlight', attrs: { color } }],
          },
        ],
      },
    ],
  }

  return generateHTML(content, [
    Document,
    Paragraph,
    Text,
    Highlight.configure({ multicolor: true }),
  ])
}

describe('multicolor highlight rendering', () => {
  test('renders a color from JSON', () => {
    expect(renderHighlight('#ffcc00')).toBe(
      '<p><mark data-color="#ffcc00" style="background-color: #ffcc00; color: inherit;">Example</mark></p>',
    )
  })

  test('does not render extra declarations from JSON', () => {
    expect(renderHighlight('red; position: fixed')).toBe('<p><mark>Example</mark></p>')
  })
})
