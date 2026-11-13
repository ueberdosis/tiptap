// @vitest-environment node
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vite-plus/test'

import { renderToReactElement } from '../../src/pm/react/react.js'

describe('static React style attributes', () => {
  it('preserves custom properties and complete URLs on nodes and marks during SSR', () => {
    const styledParagraph = Paragraph.configure({
      HTMLAttributes: {
        style:
          '--node-color: blue; color: blue; background-image: url("data:image/svg+xml;base64,PHN2Zy8+");',
      },
    })
    const styledBold = Bold.extend({
      renderHTML() {
        return [
          'span',
          {
            style: 'color: red; --my-color: red; background-image: url(https://example.com/a.png);',
          },
          0,
        ]
      },
    })
    const html = renderToStaticMarkup(
      renderToReactElement({
        extensions: [Document, styledParagraph, Text, styledBold],
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Styled text', marks: [{ type: 'bold' }] }],
            },
          ],
        },
      }),
    )

    expect(html).toBe(
      '<p style="--node-color:blue;color:blue;background-image:url(&quot;data:image/svg+xml;base64,PHN2Zy8+&quot;)"><span style="color:red;--my-color:red;background-image:url(https://example.com/a.png)">Styled text</span></p>',
    )
  })
})
