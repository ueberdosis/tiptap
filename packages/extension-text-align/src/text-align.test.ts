import { generateHTML, type JSONContent } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, test } from 'vite-plus/test'

import { TextAlign } from './text-align.js'

const renderParagraph = (textAlign: string) => {
  const content: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign },
        content: [{ type: 'text', text: 'Example' }],
      },
    ],
  }

  return generateHTML(content, [
    Document,
    Paragraph,
    Text,
    TextAlign.configure({ types: ['paragraph'] }),
  ])
}

describe('text align rendering', () => {
  test('renders an allowed alignment from JSON', () => {
    expect(renderParagraph('center')).toBe('<p style="text-align: center;">Example</p>')
  })

  test('does not render extra declarations from JSON', () => {
    expect(renderParagraph('left; position: fixed')).toBe('<p>Example</p>')
  })

  test('does not render an alignment outside the allowlist', () => {
    expect(renderParagraph('start')).toBe('<p>Example</p>')
  })
})
