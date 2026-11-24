import { generateHTML, type JSONContent } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import {
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  LineHeight,
  TextStyle,
} from '@tiptap/extension-text-style'
import { describe, expect, test } from 'vite-plus/test'

const extensions = [
  Document,
  Paragraph,
  Text,
  TextStyle,
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  LineHeight,
]

const createContent = (attribute: string): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Example',
          marks: [
            {
              type: 'textStyle',
              attrs: {
                [attribute]: 'red; position: fixed',
              },
            },
          ],
        },
      ],
    },
  ],
})

describe('text style attribute validation', () => {
  test.each(['backgroundColor', 'color', 'fontFamily', 'fontSize', 'lineHeight'])(
    'does not render extra declarations from JSON in %s',
    attribute => {
      const html = generateHTML(createContent(attribute), extensions)

      expect(html).toBe('<p><span>Example</span></p>')
    },
  )
})
