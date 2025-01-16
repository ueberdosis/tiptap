import ReactPDF from '@react-pdf/renderer'

import { renderJSONContentToReactPdf } from './react-pdf.js'

/**
 * This example demonstrates how to render a JSON representation of a node to a React element
 * It does so without including Prosemirror or Tiptap, it is the lightest possible way to render JSON content
 * But, since it doesn't include Prosemirror or Tiptap, it cannot automatically render marks or nodes for you.
 * If you need that, you should use the `renderToReactElement` from `@tiptap/static-renderer`
 *
 * You have complete control over the rendering process. And can replace how each Node/Mark is rendered.
 */

// eslint-disable-next-line no-console
const Element = renderJSONContentToReactPdf()({
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        content: [
          {
            type: 'text',
            text: 'hello world',
            marks: [],
          },
        ],
        attrs: { level: 2 },
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'hello world',
            marks: [],
          },
          {
            type: 'text',
            text: 'hello world today is a test of this and of thathello world today is a test of this and of thathello world today is a test of this and of thathello world today is a test of this and of thathello world today is a test of this and of thathello world today is a test of this and of thathello world today is a test of this and of that',
            marks: [],
          },
          {
            type: 'text',
            text: 'hello world',
            marks: [],
          },
          {
            type: 'text',
            text: 'hello world',
            marks: [],
          },
          {
            type: 'text',
            text: 'hello world',
            marks: [],
          },
        ],
        attrs: { level: 2 },
      },
    ],
    attrs: {},
  },
})

ReactPDF.render(Element as any, `${__dirname}/example.pdf`)
