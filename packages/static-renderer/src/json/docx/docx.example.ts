import { Document, FileChild, Packer, Paragraph, Table, TableCell, TableRow, TextRun, XmlComponent } from 'docx'

import { renderDocxChildrenToDocxElement, renderJSONContentToDocxElement } from './docx.js'

const table = new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Hello')],
        }),
        new TableCell({
          children: [],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [],
        }),
        new TableCell({
          children: [new Paragraph('World')],
        }),
      ],
    }),
  ],
})

const pmDoc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Hello World, This should be in BOLD ',
          marks: [
            {
              type: 'bold',
            },
          ],
        },
        {
          type: 'mention',
          attrs: {
            id: 'A mention? How random',
          },
        },
        {
          type: 'text',
          text: " Italic & Bold, aren't we fancy",
          marks: [
            {
              type: 'italic',
            },
            {
              type: 'bold',
            },
          ],
        },
      ],
    },
  ],
  attrs: {},
}

const render = renderJSONContentToDocxElement({
  nodeMapping: {
    doc({ children }) {
      return new Document({
        sections: [
          {
            children: children as FileChild[],
          },
        ],
      }) as unknown as XmlComponent
    },
    paragraph({ node, renderInlineContent }) {
      return new Paragraph({
        children: renderInlineContent({ content: node.content }),
      })
    },
    mention({ node }) {
      return new TextRun({
        text: node.attrs.id,
      })
    },
    text({ node }) {
      console.log('text', node)
      return (node as any).text
    },
  },
  mergeMapping: {
    bold() {
      return { type: 'run', properties: { bold: true } }
    },
    italic() {
      return { type: 'run', properties: { italics: true } }
    },
    underline() {
      return { type: 'run', properties: { underline: { type: 'single' } } }
    },
    highlight() {
      return { type: 'run', properties: { highlight: 'yellow' } }
    },
    strikethrough() {
      return { type: 'run', properties: { strike: true } }
    },
  },
  markMapping: {},
})

const doc = render({ content: pmDoc })

// console.log(doc)

const file = Bun.file('./example.docx')

Bun.write(file, await Packer.toBuffer(doc))
